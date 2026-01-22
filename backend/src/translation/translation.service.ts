import { Inject, Injectable, Logger } from "@nestjs/common"
import type {
  LanguageDTO,
  AvailableLanguages,
  TranslationOutputDTO,
} from "@shared/ts-types"
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager"
import * as deepl from "deepl-node"

@Injectable()
export class TranslationService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    if (!this.key) {
      throw new Error(
        "DEEPL_TRANSLATION_API_KEY environment variable is not set.",
      )
    }
  }

  private readonly logger = new Logger(TranslationService.name)

  private readonly key = process.env.DEEPL_TRANSLATION_API_KEY || ""
  private readonly client = new deepl.DeepLClient(this.key)

  /**
   * Cache key for available languages
   */
  private readonly availableSourceLanguagesCacheKey = "availableSourceLanguages"
  private readonly availableTargetLanguagesCacheKey = "availableTargetLanguages"
  /**
   * Cache TTL in milliseconds (7 days in this case)
   */
  private readonly availableLanguagesCacheTTL = 24 * 60 * 60 * 7 * 1000 // 7 days

  async availableLanguages(): Promise<AvailableLanguages> {
    // * MARK: - Try to retrieve languages from cache
    let languages = await this.retrieveAvailableLanguagesFromCache()
    if (
      languages?.sourceLanguages.length &&
      languages?.targetLanguages.length
    ) {
      return languages
    }

    // * MARK: - If cache is empty, fetch languages from API and update cache
    languages = {
      sourceLanguages: (await this.client.getSourceLanguages()).map((l) => ({
        code: l.code,
        name: l.name,
      })),
      targetLanguages: (await this.client.getTargetLanguages()).map((l) => ({
        code: l.code,
        name: l.name,
      })),
    }
    // * MARK: - Update cache
    await this.storeAvailableLanguagesInCache(languages)
    return languages
  }

  async translate(properties: {
    text: string
    to: deepl.TargetLanguageCode
    from?: deepl.SourceLanguageCode
  }): Promise<TranslationOutputDTO> {
    // * MARK: - Make request to API
    const result = await this.client.translateText(
      properties.text,
      properties.from ?? null,
      properties.to,
    )

    // * MARK: - Parse and return response
    const detectedLanguageCode: string = result.detectedSourceLang
    console.log(detectedLanguageCode)
    const detectedLanguage = await this.getLanguageDetails(detectedLanguageCode)

    return {
      translatedText: result.text,
      detectedLanguage: detectedLanguage!,
    }
  }

  private async retrieveAvailableLanguagesFromCache(): Promise<AvailableLanguages | null> {
    const cachedSourceLanguages: LanguageDTO[] | null =
      (await this.cacheManager.get(this.availableSourceLanguagesCacheKey)) as
        | LanguageDTO[]
        | null

    const cachedTargetLanguages: LanguageDTO[] | null =
      (await this.cacheManager.get(this.availableTargetLanguagesCacheKey)) as
        | LanguageDTO[]
        | null

    return {
      sourceLanguages: cachedSourceLanguages ?? [],
      targetLanguages: cachedTargetLanguages ?? [],
    }
  }
  private async storeAvailableLanguagesInCache(languages: AvailableLanguages) {
    this.logger.log(
      `Storing ${languages.sourceLanguages.length} source languages and ${languages.targetLanguages.length} target languages in cache...`,
    )
    await this.cacheManager.set(
      this.availableSourceLanguagesCacheKey,
      languages.sourceLanguages,
      this.availableLanguagesCacheTTL,
    )
    await this.cacheManager.set(
      this.availableTargetLanguagesCacheKey,
      languages.targetLanguages,
      this.availableLanguagesCacheTTL,
    )
  }

  private async getLanguageDetails(code: string): Promise<LanguageDTO | null> {
    let availableLanguages = await this.retrieveAvailableLanguagesFromCache()
    if (
      !availableLanguages?.sourceLanguages.length ||
      !availableLanguages?.targetLanguages.length
    ) {
      await this.availableLanguages()
    }

    availableLanguages = await this.retrieveAvailableLanguagesFromCache()
    if (
      !availableLanguages ||
      !availableLanguages.sourceLanguages.length ||
      !availableLanguages.targetLanguages.length
    ) {
      // It should never happen, but just in case
      this.logger.error(
        "No languages found in cache, probably an issue with the API",
      )
      this.logger.log(availableLanguages)
    }
    let language = availableLanguages?.sourceLanguages.find(
      (l) => l.code === code,
    )
    if (!language) {
      language = availableLanguages?.targetLanguages.find(
        (l) => l.code === code,
      )
    }

    return language || null
  }
}
