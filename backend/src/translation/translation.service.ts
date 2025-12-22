import { Injectable } from "@nestjs/common"
import axios from "axios"
import { v4 as uuidv4 } from "uuid"
import type { LanguageDTO, TranslationOutputDTO } from "@shared/ts-types"

@Injectable()
export class TranslationService {
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
  languages: LanguageDTO[] | null = null

  async availableLanguages(): Promise<LanguageDTO[]> {
    const response = await axios({
      baseURL: this.baseUrl,
      url: "/languages",
      method: "GET",
      params: {
        "api-version": this.apiVersion,
      },
      headers: this.headers,
    })
    const languages: LanguageDTO[] = Object.keys(response.data.translation).map(
      (key) => {
        const current = response.data.translation[key]
        return {
          code: key,
          name: current.name,
          nativeName: current.nativeName,
        }
      },
    )
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

  private async languageDetails(code: string): Promise<LanguageDTO | null> {
    if (!this.languages) {
      this.languages = await this.availableLanguages()
    }
    const language = this.languages.find((l) => l.code === code)
    return language || null
  }

  /*
  [
    {
        "detectedLanguage": {
            "language": "pl",
            "score": 1
        },
        "translations": [
            {
                "text": "Let's translate something!",
                "to": "en"
            }
        ]
    }
]
  */
}
