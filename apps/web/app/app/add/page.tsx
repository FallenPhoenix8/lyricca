import { AddPageClientWrapper } from "@/components/ui/add-page-client-wrapper"
import { TranslationLanguageChoiceCard } from "@/components/ui/translation-language-choice-card"
export default async function AddPage() {
  return (
    <AddPageClientWrapper>
      <TranslationLanguageChoiceCard />
    </AddPageClientWrapper>
  )
}
