type LanguageDTO = {
  code: string
  name: string
  nativeName: string
}

type TranslationInputDTO = {
  text: string
  from?: string
  to: string
}

type TranslationOutputDTO = {
  translatedText: string
  detectedLanguage?: LanguageDTO
}

export type { LanguageDTO, TranslationInputDTO, TranslationOutputDTO }
