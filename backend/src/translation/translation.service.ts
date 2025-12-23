import { Inject, Injectable } from "@nestjs/common"
import axios from "axios"
import { v4 as uuidv4 } from "uuid"
import type { LanguageDTO, TranslationOutputDTO } from "@shared/ts-types"
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager"

@Injectable()
export class TranslationService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  readonly key = process.env.TRANSLATION_API_KEY
  readonly baseUrl = "https://api.cognitive.microsofttranslator.com"
  readonly location = "westeurope"
  readonly apiVersion = "3.0"
  readonly headers = {
    "Ocp-Apim-Subscription-Key": this.key,
    "Ocp-Apim-Subscription-Region": this.location,
    "Content-type": "application/json",
    "X-ClientTraceId": uuidv4().toString(),
  }
  /**
   * Cache key for available languages
   */
  readonly availableLanguagesCacheKey = "availableLanguages"
  /**
   * Cache TTL in milliseconds (7 days in this case)
   */
  readonly availableLanguagesCacheTTL = 24 * 60 * 60 * 7 * 1000 // 7 days

  async availableLanguages(): Promise<LanguageDTO[]> {
    // * MARK: - Try to retrieve languages from cache
    let languages = await this.retrieveAvailableLanguagesFromCache()
    if (languages) {
      return languages
    }

    // * MARK: - If cache is empty, fetch languages from API and update cache
    const response = await axios({
      baseURL: this.baseUrl,
      url: "/languages",
      method: "GET",
      params: {
        "api-version": this.apiVersion,
      },
      headers: this.headers,
    })
    languages = Object.keys(response.data.translation).map((key) => {
      const current = response.data.translation[key]
      return {
        code: key,
        name: current.name,
        nativeName: current.nativeName,
      }
    })
    // * MARK: - Update cache
    await this.storeAvailableLanguagesInCache(languages)
    return languages
  }

  async translate(properties: {
    text: string
    to: string
    from?: string
  }): Promise<TranslationOutputDTO> {
    const tempParams = properties.from ? { from: properties.from } : {}
    const response = await axios({
      baseURL: this.baseUrl,
      url: "/translate",
      method: "POST",
      headers: this.headers,
      params: {
        ...tempParams,
        "api-version": this.apiVersion,
        to: properties.to,
      },
      data: [
        {
          text: properties.text,
        },
      ],
      responseType: "json",
    })
    const data = response.data[0]
    const translatedText = data.translations[0]?.text
    if (properties.from) {
      return {
        translatedText,
      }
    }
    const detectedLanguageCode: string = data.detectedLanguage?.language
    const detectedLanguage = await this.languageDetails(detectedLanguageCode)

    return detectedLanguage
      ? {
          translatedText,
          detectedLanguage,
        }
      : {
          translatedText,
        }
  }

  private async retrieveAvailableLanguagesFromCache(): Promise<
    LanguageDTO[] | null
  > {
    const cachedLanguages: LanguageDTO[] | null = (await this.cacheManager.get(
      this.availableLanguagesCacheKey,
    )) as LanguageDTO[] | null
    return cachedLanguages
  }
  private async storeAvailableLanguagesInCache(languages: LanguageDTO[]) {
    await this.cacheManager.set(
      this.availableLanguagesCacheKey,
      languages,
      this.availableLanguagesCacheTTL,
    )
  }

  private async languageDetails(code: string): Promise<LanguageDTO | null> {
    if (!(await this.retrieveAvailableLanguagesFromCache())) {
      await this.availableLanguages()
    }
    const languages = (await this.retrieveAvailableLanguagesFromCache()) ?? []
    if (!languages) {
      // It should never happen, but just in case
      console.error(
        "No languages found in cache, probably an issue with the API",
      )
    }
    const language = languages.find((l) => l.code === code)
    return language || null
  }
}
