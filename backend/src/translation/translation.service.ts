import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common"
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
    if (this.key.length === 0) {
      throw new Error(
        "DEEPL_TRANSLATION_API_KEY environment variable is not set.",
      )
    }
    this.client = new deepl.DeepLClient(this.key)
  }

  private readonly logger = new Logger(TranslationService.name)

  private readonly key: string = process.env.DEEPL_TRANSLATION_API_KEY || ""
  private readonly client: deepl.DeepLClient

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
      sourceLanguages: (await this.client.getSourceLanguages())
        .filter((l) => l.code != "en")
        .map((l) => ({
          code: l.code,
          name: l.name,
        })),
      targetLanguages: (await this.client.getTargetLanguages())
        .filter((l) => l.code != "en")
        .map((l) => ({
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
    // * MARK: - Check if language code exists
    if (!(await this.isLanguageCodeExists(properties.to))) {
      throw new BadRequestException(
        `Language code "${properties.to}" does not exist.`,
      )
    }

    if (
      properties.from &&
      !(await this.isLanguageCodeExists(properties.from))
    ) {
      throw new BadRequestException(
        `Language code "${properties.from}" does not exist.`,
      )
    }

    // * MARK: - Make request to API
    const lines = properties.text.split("\n")
    const result = await this.client.translateText(
      lines,
      properties.from ?? null,
      properties.to,
    )

    // * MARK: - Parse and return response
    const detectedLanguageCodes = new Set<deepl.SourceLanguageCode>(
      result.map((r) => r.detectedSourceLang),
    )
    const detectedLanguages = await Promise.all(
      Array.from(detectedLanguageCodes).map((code) =>
        this.getLanguageDetails(code),
      ),
    )
    const filteredDetectedLanguages = detectedLanguages.filter(
      (l) => l !== null,
    ) as LanguageDTO[]
    const translatedTextLines = result.map((r) => r.text)

    return {
      translatedTextLines,
      detectedLanguages: filteredDetectedLanguages,
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

    // * MARK: - Store languages in cache
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
    // * MARK: - Try to retrieve languages from cache, if not, update cache
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
        "No languages found in cache, probably an issue with the API (getLanguageDetails)",
      )
      this.logger.log(availableLanguages)
    }

    // * MARK: - Find language in cache
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

  private async isLanguageCodeExists(languageCode: string): Promise<boolean> {
    // * MARK: - Try to retrieve languages from cache, if not, update cache
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
        "No languages found in cache, probably an issue with the API (isLanguageCodeExists)",
      )
      this.logger.log(availableLanguages)
      return false
    }

    // * MARK: - Check if language code exists in cache
    return (
      availableLanguages.sourceLanguages.some((l) => l.code === languageCode) ||
      availableLanguages.targetLanguages.some((l) => l.code === languageCode)
    )
  }
}
