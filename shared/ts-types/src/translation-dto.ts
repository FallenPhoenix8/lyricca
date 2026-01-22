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
  translatedText: string
  detectedLanguage: LanguageDTO
}

export type {
  LanguageDTO,
  AvailableLanguages,
  TranslationInputDTO,
  TranslationOutputDTO,
}
