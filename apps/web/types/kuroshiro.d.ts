declare module "kuroshiro" {
  export type Syllabary = "hiragana" | "katakana" | "romaji"
  export type ConvertMode = "normal" | "spaced" | "okurigana" | "furigana"
  export type RomajiSystem = "nippon" | "passport" | "hepburn"

  export interface ConvertOptions {
    to?: Syllabary
    mode?: ConvertMode
    romajiSystem?: RomajiSystem
    delimiter_start?: string
    delimiter_end?: string
  }

  export default class Kuroshiro {
    constructor()
    init(analyzer: any): Promise<void>
    convert(str: string, options?: ConvertOptions): Promise<string>

    static Util: {
      isHiragana(char: string): boolean
      isKatakana(char: string): boolean
      isKana(char: string): boolean
      isKanji(char: string): boolean
      isJapanese(char: string): boolean
      hasHiragana(str: string): boolean
      hasKatakana(str: string): boolean
      hasKana(str: string): boolean
      hasKanji(str: string): boolean
      hasJapanese(str: string): boolean
      kanaToHiragna(str: string): string
      kanaToKatakana(str: string): string
      kanaToRomaji(str: string, system?: RomajiSystem): string
    }
  }
}

declare module "kuroshiro-analyzer-kuromoji" {
  export interface KuromojiAnalyzerOptions {
    dictPath?: string
  }

  export default class KuromojiAnalyzer {
    constructor(options?: KuromojiAnalyzerOptions)
    init(): Promise<void>
    parse(str: string): Promise<any>
  }
}
