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
import { OpenAI } from "openai"

type LLMConfig = {
  baseURL: string
  apiKey: string
}

@Injectable()
export class TranslationService {
  private readonly llmConfig: LLMConfig = {
    baseURL: process.env.OPENAI_BASE_URL || "",
    apiKey: process.env.OPENAI_API_KEY || "",
  }

  private readonly openAIClient = new OpenAI({
    baseURL: this.llmConfig.baseURL,
    apiKey: this.llmConfig.apiKey,
  })

  private readonly logger = new Logger(TranslationService.name)
  private readonly maxChunkSize = 2000
  private readonly googleTranslateURLBase = "https://translate.googleapis.com/"

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    if (!this.llmConfig.apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set.")
    }
    if (!this.llmConfig.baseURL) {
      throw new Error("OPENAI_BASE_URL environment variable is not set.")
    }
  }

  private getOpenAIModel(text: string) {
    const generalTranslationModel = "nousresearch/hermes-3-llama-3.1-405b"

    if (/\p{Script=Hangul}/u.test(text)) return generalTranslationModel
    if (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(text))
      return generalTranslationModel
    if (/\p{Script=Cyrillic}/u.test(text)) return generalTranslationModel
    if (/\p{Script=Latin}/u.test(text)) return generalTranslationModel

    return generalTranslationModel
  }

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
    return `@@L${String(index).padStart(6, "0")}@@`
  }
  private encodeLinesForTranslation(text: string): {
    text: string
    lineCount: number
  } {
    const lines = text.split("\n")

    return {
      lineCount: lines.length,
      text: lines
        .map((line, index) => `${this.makeLineMarker(index)} ${line}`)
        .join("\n"),
    }
  }

  private decodeTranslatedLines(text: string, lineCount: number): string[] {
    const markerRegex = /@@L(\d{6})@@/g
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

    // * MARK: - Try OpenAI translation
    const openAITranslation = await this.translateWithOpenAI({
      text: properties.text,
      targetLanguage: properties.to,
    })

    const isLineCountMatch =
      openAITranslation &&
      openAITranslation.translatedTextLines.length === lines.length

    if (openAITranslation && isLineCountMatch) {
      this.logger.log("Successfully completed translation with OpenAI.")
      return openAITranslation
    } else if (openAITranslation) {
      this.logger.error(
        "OpenAI translation line count mismatch.",
        lines,
        openAITranslation.translatedTextLines,
      )
    }

    // * MARK: - Fallback to Google Translate if OpenAI failed
    this.logger.warn(
      "OpenAI failed or timed out. Falling back to Google Translate...",
    )
    const encodedPayload = this.encodeLinesForTranslation(properties.text)

    const result = await this.translateWithGoogleTranslate({
      from: properties.from || "auto",
      to: properties.to,
      text: encodedPayload.text,
      userAgent: properties.userAgent,
      lineCount: encodedPayload.lineCount,
    })

    this.logger.log("Successfully completed translation with Google Translate.")
    return {
      ...result,
      withGoogleTranslate: true,
    }
  }

  private covertTextToChunks(
    text: string,
    maxChunkSize = this.maxChunkSize,
  ): string[] {
    if (text.length <= maxChunkSize) {
      return [text]
    }

    const chunks: string[] = []
    let currentChunk: string = ""
    const lines = text.split("\n")

    for (const line of lines) {
      if (currentChunk.length + line.length <= maxChunkSize) {
        currentChunk += line + "\n"
      } else {
        chunks.push(currentChunk)
        currentChunk = line + "\n"
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk)
    }
    return chunks
  }

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
        throw new Error(
          `Google Translate API request failed with status ${response.status}`,
        )
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
        throw new Error("Invalid Google Translate API response structure.")
      }

      const translatedChunk = dataLines
        .map((segment) => segment?.[0] ?? "")
        .join("")

      translatedTextChunks.push(translatedChunk)
    }

    const detectedLanguages = detectedLanguagesOptional.filter(Boolean)
    if (!detectedLanguages.length) {
      detectedLanguages.push({ code: parameters.from, name: parameters.from })
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

  private async translateWithOpenAI(parameters: {
    text: string
    targetLanguage: string
  }): Promise<TranslationOutputDTO | null> {
    // * MARK: - Prepare translation instructions
    const translationInstructions = [
      `Translate every lyric line completely into language with code "${parameters.targetLanguage}".`,
      "For mixed-language or mixed-script lines, identify each fragment separately and translate all fragments.",
      "Treat Latin-script words inside non-Latin lines as source text, not as proper nouns.",
      "If a line is grammatically irregular, infer its intended meaning from the surrounding lyrics instead of copying it.",
      "Preserve meaning, tone, repetition, order, and empty lines.",
      "IMPORTANT: Use only the target language in the result, except proper names and non-lexical sounds.",
      "CRITICAL RULE: Output ONLY the translated lines. Never include introductions like 'Here is the translation:' or markdown fences like ```.",
      "CRITICALLY IMPORTANT RULE: Do not add or remove lines. Number of lines must be the same as the original. Don't add any explanations, notes or additional lines.",
      `CRITICAL: Return response in following format:
lyrics line 1
lyrics line 2
lyrics line 3
...
      `,
    ].join("\n")

    // * MARK: - Handle timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    // * MARK: - Convert to chunks and translate
    const chunks = this.covertTextToChunks(parameters.text, 500)
    /**
     * Helper function to translate a chunk of text
     */
    const translate = async (chunk: string) => {
      const response = await this.openAIClient.chat.completions.create(
        {
          model: this.getOpenAIModel(chunk),
          temperature: 0.2,
          max_tokens: 2048,
          messages: [
            {
              role: "system",
              content: translationInstructions,
            },
            {
              role: "user",
              content: chunk,
            },
          ],
        },
        { signal: controller.signal },
      )

      const messageContent = response.choices[0].message?.content
      if (!messageContent?.trim()) {
        this.logger.error(
          "Failed to get translation response.",
          messageContent,
          response,
        )
        return []
      }

      const translationContent = messageContent
        .replace(/<think>[\s\S]*?<\/think>/g, "")
        .replace("```", "")
        .replace("```json", "")
        .replace("```lyrics", "")

      const translated: string[] = translationContent
        .replace("- ", "")
        .split("\n")
        .map((l) => l.trim())
      if (!translated) {
        this.logger.error("Failed to parse translation response.", translated)
        return []
      }

      return translated
    }
    try {
      const translatedTextChunksPromises: Promise<string[]>[] = chunks.map(
        async (chunk) => translate(chunk),
      )
      const translatedTextChunks = await Promise.all(
        translatedTextChunksPromises,
      )
      let translatedLines: string[] = []

      for (const translatedTextChunk of translatedTextChunks) {
        if (translatedTextChunk.length === 0) {
          return null
        }
        translatedLines = translatedLines.concat(translatedTextChunk)
      }

      return {
        detectedLanguages: [
          {
            code: parameters.targetLanguage,
            name: parameters.targetLanguage,
          },
        ],
        translatedTextLines: translatedLines.map((line) => line.trim()),
        withOpenAI: true,
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        this.logger.error(
          "OpenAI-compatible translation request timed out after 30 seconds.",
        )
      } else {
        this.logger.error(
          "OpenAI-compatible translation request failed:",
          error,
        )
      }

      return null
    } finally {
      clearTimeout(timeoutId)
    }
  }
}
