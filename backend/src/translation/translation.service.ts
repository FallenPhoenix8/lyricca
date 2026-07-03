import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common"
import type {
  LanguageDTO,
  AvailableLanguages,
  TranslationOutputDTO,
  TranslationUsageDTO,
} from "@shared/ts-types"
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager"
// import * as deepl from "deepl-node"

@Injectable()
export class TranslationService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    if (this.key.length === 0) {
      throw new Error(
        "DEEPL_TRANSLATION_API_KEY environment variable is not set.",
      )
    }
    // this.client = new deepl.DeepLClient(this.key)
  }

  private readonly logger = new Logger(TranslationService.name)
  /**
   * Maximum size of a chunk in characters.
   */
  private readonly maxChunkSize = 3000

  private readonly key: string = process.env.DEEPL_TRANSLATION_API_KEY || ""
  // private readonly client: deepl.DeepLClient
  private readonly googleTranslateURLBase = "https://translate.googleapis.com/"

  //translate_a/single?client=gtx&sl=auto&tl=pl&dt=t&q=something
  private async getGoogleTranslateFullURL(
    sourceLanguage: string,
    targetLanguage: string,
    text: string,
  ): Promise<URL> {
    const url = new URL("/translate_a/single", this.googleTranslateURLBase)
    url.searchParams.append("client", "gtx")
    url.searchParams.append("sl", sourceLanguage)
    url.searchParams.append("tl", targetLanguage)
    url.searchParams.append("dt", "t")
    url.searchParams.append("q", text)
    return url
  }

  private makeLineMarker(index: number): string {
    return `⟬${String(index).padStart(6, "0")}⟭`
  }

  private encodeLinesForTranslation(text: string): {
    text: string
    lineCount: number
  } {
    const lines = text.split("\n")

    return {
      lineCount: lines.length,

      // Marker before every original line.
      // Keep the original line content untouched.
      text: lines
        .map((line, index) => `${this.makeLineMarker(index)}${line}`)
        .join("\n"),
    }
  }

  private decodeTranslatedLines(text: string, lineCount: number): string[] {
    const markerRegex = /⟬\s*(\d{6})\s*⟭/g
    const matches = [...text.matchAll(markerRegex)]

    const result = new Array<string>(lineCount).fill("")

    if (matches.length === 0) {
      this.logger.warn("No translation line markers found.")
      result[0] = text
      return result
    }

    for (let i = 0; i < matches.length; i++) {
      const current = matches[i]
      const next = matches[i + 1]

      const rawIndex = current[1]
      const index = Number(rawIndex)

      if (!Number.isInteger(index) || index < 0 || index >= lineCount) {
        continue
      }

      const start = current.index! + current[0].length
      const end = next?.index ?? text.length

      result[index] = text.slice(start, end).trim()
    }

    return result
  }

  async translate(properties: {
    text: string
    to: string
    from?: string
    userAgent: string
  }): Promise<TranslationOutputDTO> {
    const lines = properties.text.split("\n")

    const result = await this.translateWithGoogleTranslate({
      from: properties.from || "auto",
      to: properties.to,
      text: lines.map((l) => (!l ? " " : l)).join("\n"),
      userAgent: properties.userAgent,
      lineCount: lines.length,
    })

    return {
      ...result,
      withGoogleTranslate: true,
    }
  }

  private covertTextToChunks(text: string): string[] {
    if (text.length <= this.maxChunkSize) {
      return [text]
    } else {
      const chunks: string[] = []
      let currentChunk: string = ""
      const lines = text.split("\n")
      for (const line of lines) {
        if (currentChunk.length + line.length <= this.maxChunkSize) {
          currentChunk += line + "\n"
        } else {
          chunks.push(currentChunk)
          currentChunk = line + "\n"
        }
      }
      return chunks
    }
  }

  /**
   * @throws
   */
  private async translateWithGoogleTranslate(parameters: {
    text: string
    from: string
    to: string
    userAgent: string
    lineCount: number
  }): Promise<TranslationOutputDTO> {
    const chunks = this.covertTextToChunks(parameters.text)
    const translatedTextChunks: string[] = []

    const detectedLanguagesOptional: LanguageDTO[] = []

    for (const chunk of chunks) {
      const url = await this.getGoogleTranslateFullURL(
        parameters.from,
        parameters.to,
        chunk,
      )

      const response = await fetch(url, {
        headers: { "User-Agent": parameters.userAgent },
      })

      if (!response.ok) {
        throw new Error("Google Translate API request failed.")
      }

      const data = await response.json()

      const detectedLanguageCode = data?.[2]
      if (
        detectedLanguageCode &&
        !detectedLanguagesOptional.some((l) => l.code === detectedLanguageCode)
      ) {
        detectedLanguagesOptional.push({
          code: detectedLanguageCode,
          name: detectedLanguageCode,
        })
      }

      const dataLines = data?.[0] as any[][] | undefined

      if (!Array.isArray(dataLines)) {
        throw new Error("Invalid Google Translate API response.")
      }

      const translatedChunk = dataLines
        .map((segment) => segment?.[0] ?? "")
        .join("")

      translatedTextChunks.push(translatedChunk)
    }

    const detectedLanguages = detectedLanguagesOptional.filter(Boolean)

    if (!detectedLanguages.length) {
      throw new Error(
        "Invalid Google Translate API response (detected languages).",
      )
    }

    const translatedText = translatedTextChunks.join("")

    const translatedTextLines = this.decodeTranslatedLines(
      translatedText,
      parameters.lineCount,
    )

    return {
      translatedTextLines,
      detectedLanguages,
    }
  }

  /**
   * Cache key for available languages
   */
  // private readonly availableSourceLanguagesCacheKey = "availableSourceLanguages"
  // private readonly availableTargetLanguagesCacheKey = "availableTargetLanguages"
  /**
   * Cache TTL in milliseconds (7 days in this case)
   */
  // private readonly availableLanguagesCacheTTL = 24 * 60 * 60 * 7 * 1000 // 7 days

  // async availableLanguages(): Promise<AvailableLanguages> {
  //   // * MARK: - Try to retrieve languages from cache

  //   if (
  //     languages?.sourceLanguages.length &&
  //     languages?.targetLanguages.length
  //   ) {
  //     return languages
  //   }

  //   languages = {
  //     sourceLanguages: (await this.client.getSourceLanguages())

  //       .map((l) => ({
  //         code: l.code,
  //         name: l.name,
  //       })),
  //     targetLanguages: (await this.client.getTargetLanguages())
  //       .filter((l) => l.code != "en")
  //       .map((l) => ({
  //         code: l.code,
  //         name: l.name,
  //       })),
  //   }

  //   await this.storeAvailableLanguagesInCache(languages)
  //   return languages
  // }

  // async getUsage(): Promise<TranslationUsageDTO> {
  //   try {
  //     const { character } = await this.client.getUsage()
  //     if (!character) {
  //       throw new InternalServerErrorException(
  //         "Translation usage request failed.",
  //       )
  //     }
  //     return character
  //   } catch (error) {
  //     console.error("Translation usage request failed:", error)
  //     throw new InternalServerErrorException(
  //       "Translation usage request failed.",
  //     )
  //   }
  // }

  // async translate(properties: {
  //   text: string
  //   to: deepl.TargetLanguageCode
  //   from?: deepl.SourceLanguageCode
  //   userAgent: string
  // }): Promise<TranslationOutputDTO> {
  //   // * MARK: - Check if language code exists
  //   if (!(await this.isLanguageCodeExists(properties.to, "target"))) {
  //     throw new BadRequestException(
  //       `Language code "${properties.to}" does not exist in target languages.`,
  //     )
  //   }

  //   if (
  //     properties.from &&
  //     !(await this.isLanguageCodeExists(properties.from, "source"))
  //   ) {
  //     throw new BadRequestException(
  //       `Language code "${properties.from}" does not exist in source languages.`,
  //     )
  //   }
  //   const lines = properties.text.split("\n")
  //   // * MARK: - Make request to Google Translate API
  //   try {
  //     const result = await this.translateWithGoogleTranslate({
  //       from: properties.from || "auto",
  //       to: properties.to,
  //       text: lines.map((l) => (!l ? " " : l)).join("\n"),
  //       userAgent: properties.userAgent,
  //     })
  //     return {
  //       ...result,
  //       withGoogleTranslate: true,
  //     }
  //   } catch (error) {
  //     console.error(
  //       "Google Translate API request failed, falling back to DeepL:",
  //       error,
  //     )
  //   }

  //   // * MARK: - Make request to DeepL API
  //   console.log("Translating with DeepL...")
  //   let result: deepl.TextResult[] | null = null
  //   try {
  //     result = await this.client.translateText(
  //       lines.map((l) => (!l ? " " : l)), // Deepl API does not accept empty strings, so we replace them with a space
  //       properties.from ?? null,
  //       properties.to,
  //     )
  //   } catch (error) {
  //     if (error.toString().toLowerCase().includes("bad request")) {
  //       throw new BadRequestException(
  //         "Invalid translation request, probably due to invalid language codes.",
  //       )
  //     }
  //   }

  //   if (result === null) {
  //     throw new InternalServerErrorException("Translation failed.")
  //   }

  //   // * MARK: - Parse and return response
  //   const detectedLanguageCodes = new Set<deepl.SourceLanguageCode>(
  //     result.map((r) => r.detectedSourceLang),
  //   )
  //   const detectedLanguages = await Promise.all(
  //     Array.from(detectedLanguageCodes).map((code) =>
  //       this.getLanguageDetails(code),
  //     ),
  //   )
  //   const filteredDetectedLanguages = detectedLanguages.filter(
  //     (l) => l !== null,
  //   ) as LanguageDTO[]
  //   const translatedTextLines = result.map((r) => r.text)

  //   return {
  //     translatedTextLines,
  //     detectedLanguages: filteredDetectedLanguages,
  //   }
  // }

  // private async retrieveAvailableLanguagesFromCache(): Promise<AvailableLanguages | null> {
  //   const cachedSourceLanguages: LanguageDTO[] | null =
  //     (await this.cacheManager.get(this.availableSourceLanguagesCacheKey)) as
  //       | LanguageDTO[]
  //       | null

  //   const cachedTargetLanguages: LanguageDTO[] | null =
  //     (await this.cacheManager.get(this.availableTargetLanguagesCacheKey)) as
  //       | LanguageDTO[]
  //       | null

  //   return {
  //     sourceLanguages: cachedSourceLanguages ?? [],
  //     targetLanguages: cachedTargetLanguages ?? [],
  //   }
  // }
  // private async storeAvailableLanguagesInCache(languages: AvailableLanguages) {
  //   this.logger.log(
  //     `Storing ${languages.sourceLanguages.length} source languages and ${languages.targetLanguages.length} target languages in cache...`,
  //   )

  //   // * MARK: - Store languages in cache
  //   await this.cacheManager.set(
  //     this.availableSourceLanguagesCacheKey,
  //     languages.sourceLanguages,
  //     this.availableLanguagesCacheTTL,
  //   )
  //   await this.cacheManager.set(
  //     this.availableTargetLanguagesCacheKey,
  //     languages.targetLanguages,
  //     this.availableLanguagesCacheTTL,
  //   )
  // }

  // private async getLanguageDetails(code: string): Promise<LanguageDTO | null> {
  //   // * MARK: - Try to retrieve languages from cache, if not, update cache
  //   let availableLanguages = await this.retrieveAvailableLanguagesFromCache()
  //   if (
  //     !availableLanguages?.sourceLanguages.length ||
  //     !availableLanguages?.targetLanguages.length
  //   ) {
  //     await this.availableLanguages()
  //   }
  //   availableLanguages = await this.retrieveAvailableLanguagesFromCache()
  //   if (
  //     !availableLanguages ||
  //     !availableLanguages.sourceLanguages.length ||
  //     !availableLanguages.targetLanguages.length
  //   ) {
  //     // It should never happen, but just in case
  //     this.logger.error(
  //       "No languages found in cache, probably an issue with the API (getLanguageDetails)",
  //     )
  //     this.logger.log(availableLanguages)
  //   }

  //   // * MARK: - Find language in cache
  //   let language = availableLanguages?.sourceLanguages.find(
  //     (l) => l.code === code,
  //   )
  //   if (!language) {
  //     language = availableLanguages?.targetLanguages.find(
  //       (l) => l.code === code,
  //     )
  //   }

  //   return language || null
  // }

  // private async isLanguageCodeExists(
  //   languageCode: string,
  //   origin: "source" | "target",
  // ): Promise<boolean> {
  //   // * MARK: - Try to retrieve languages from cache, if not, update cache
  //   let availableLanguages = await this.retrieveAvailableLanguagesFromCache()
  //   if (
  //     !availableLanguages?.sourceLanguages.length ||
  //     !availableLanguages?.targetLanguages.length
  //   ) {
  //     await this.availableLanguages()
  //   }
  //   availableLanguages = await this.retrieveAvailableLanguagesFromCache()
  //   if (
  //     !availableLanguages ||
  //     !availableLanguages.sourceLanguages.length ||
  //     !availableLanguages.targetLanguages.length
  //   ) {
  //     // It should never happen, but just in case
  //     this.logger.error(
  //       "No languages found in cache, probably an issue with the API (isLanguageCodeExists)",
  //     )
  //     this.logger.log(availableLanguages)
  //     return false
  //   }

  //   // * MARK: - Check if language code exists in cache
  //   if (origin === "source") {
  //     return availableLanguages.sourceLanguages.some(
  //       (l) => l.code === languageCode,
  //     )
  //   } else {
  //     return availableLanguages.targetLanguages.some(
  //       (l) => l.code === languageCode,
  //     )
  //   }
  // }
}
