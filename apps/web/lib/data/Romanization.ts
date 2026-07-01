import Kuroshiro from "kuroshiro"
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji"
import { convert } from "@spotxyz/hangul-romanization"
import { transliterate } from "transliteration"

export class Romanization {
  private constructor() {}
  static get shared() {
    return new Romanization()
  }
  private detectScript(text: string) {
    if (/\p{Script=Hangul}/u.test(text)) return "korean"
    if (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(text))
      return "japanese"
    if (/\p{Script=Cyrillic}/u.test(text)) return "cyrillic"
    return "default"
  }

  private async romanizeJapanese(text: string) {
    const kuroshiro = new Kuroshiro()
    await kuroshiro.init(
      new KuromojiAnalyzer({
        dictPath: "/kuromoji/dict",
      }),
    )
    return kuroshiro.convert(text, { to: "romaji" })
  }
  private async romanizeKorean(text: string) {
    return convert(text)
  }
  private async romanizeCyrillic(text: string) {
    return transliterate(text)
  }

  async romanize(text: string) {
    const script = this.detectScript(text)
    switch (script) {
      case "korean":
        return this.romanizeKorean(text)
      case "japanese":
        return this.romanizeJapanese(text)
      case "cyrillic":
        return this.romanizeCyrillic(text)
      default:
        return text
    }
  }

  hasSpecialScript(text: string): boolean {
    return this.detectScript(text) !== "default"
  }

  async romanizeLyrics(lines: string[]) {
    const romanizedLyricsText = await this.romanize(lines.join("\n"))

    return romanizedLyricsText.split("\n")
  }
}
