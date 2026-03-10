type LanguageDTO = {
  code: string
  name: string
}

type AvailableLanguages = {
  sourceLanguages: LanguageDTO[]
  targetLanguages: LanguageDTO[]
}

type TranslationInputDTO = {
  text: string
  from?: string
  to: string
}

type TranslationOutputDTO = {
  translatedTextLines: string[]
  detectedLanguages: LanguageDTO[]
}

type TranslationUsageDTO = {
  count: number
  limit: number
}

export type {
  LanguageDTO,
  AvailableLanguages,
  TranslationInputDTO,
  TranslationOutputDTO,
  TranslationUsageDTO,
}
