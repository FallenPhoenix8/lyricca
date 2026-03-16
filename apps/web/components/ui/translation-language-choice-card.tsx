import { fetchLanguages } from "@/app/app/add/actions"
import { LanguagesSelect } from "./languages-select"

export async function TranslationLanguageChoiceCard() {
  const languages = await fetchLanguages()
  return <LanguagesSelect languages={languages} />
}
