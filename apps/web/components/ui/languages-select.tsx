"use client"
import { AvailableLanguages } from "@shared/ts-types"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select"
import { Field, FieldContent, FieldGroup, FieldLabel, FieldSet } from "./field"
import { ArrowRight } from "lucide-react"
import { HStack } from "./layout"
import { Button } from "./button"
import { useQueryState } from "nuqs"

export function LanguagesSelect({
  languages,
}: {
  languages: AvailableLanguages
}) {
  const [sourceLanguage, setSourceLanguage] = useQueryState("sl", {
    defaultValue: "auto",
  })
  const [targetLanguage, setTargetLanguage] = useQueryState("tl", {
    defaultValue: "en-US",
  })
  return (
    <FieldGroup className="gap-2">
      <div className="flex flex-wrap gap-2">
        <Field className="flex-1">
          <FieldLabel>Source Language</FieldLabel>
          <FieldContent>
            <Select
              defaultValue={sourceLanguage}
              onValueChange={(value) => setSourceLanguage(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Source Language</SelectLabel>
                  <SelectItem value="auto">Detect Language</SelectItem>
                  {languages.sourceLanguages.map((language) => (
                    <SelectItem
                      value={language.code}
                      key={`source-${language.code}`}
                    >
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>
        <Field className="flex-1">
          <FieldLabel>Target Language</FieldLabel>
          <FieldContent>
            <Select
              required
              onValueChange={(value) => setTargetLanguage(value)}
              defaultValue={targetLanguage ?? undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a target language" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Target Language</SelectLabel>
                  {languages.targetLanguages.map((language) => (
                    <SelectItem
                      value={language.code}
                      key={`target-${language.code}`}
                    >
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>
      </div>
    </FieldGroup>
  )
}
