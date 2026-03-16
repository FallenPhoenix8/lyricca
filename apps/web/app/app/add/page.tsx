import { AddPageClientWrapper } from "@/components/ui/add-page-client-wrapper"
import { TranslationLanguageChoiceCard } from "@/components/ui/translation-language-choice-card"
import { Suspense } from "react"
export default function AddPage() {
  return (
    <AddPageClientWrapper>
      <TranslationLanguageChoiceCard />
    </AddPageClientWrapper>
  )
}
