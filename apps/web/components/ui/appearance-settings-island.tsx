"use client"
import { Separator } from "./separator"
import { NativeSelect, NativeSelectOption } from "./native-select"
import { SettingsIsland } from "./settings-island"
import { SettingsItem } from "./settings-item"
import { useTheme } from "next-themes"
import { useMemo } from "react"

export function AppearanceSettingsIsland() {
  const { resolvedTheme, setTheme } = useTheme()
  const vibe = useMemo(() => {
    return resolvedTheme?.split("-")[0]!
  }, [resolvedTheme])
  const mode = useMemo(() => {
    return resolvedTheme?.split("-")[1]!
  }, [resolvedTheme])

  function handleVibeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const newVibe = event.target.value
    const theme = `${newVibe}-${mode}`

    if (!theme) {
      console.error("Failed to set new theme", theme)
      return
    }
    console.log("Setting theme to", theme)
    setTheme(theme)
  }

  function handleModeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const newMode = event.target.value
    const theme = `${vibe}-${newMode}`

    if (!theme) {
      console.error("Failed to set new theme", theme)
      return
    }
    console.log("Setting theme to", theme)
    setTheme(theme)
  }
  return (
    <SettingsIsland title="Appearance">
      {/* Row 1: Theme Selection */}
      <SettingsItem
        label="Theme"
        description="Select your preferred interface style."
      >
        <NativeSelect defaultValue={mode} onChange={handleModeChange}>
          <NativeSelectOption value="light">Light</NativeSelectOption>
          <NativeSelectOption value="dark">Dark</NativeSelectOption>
        </NativeSelect>
      </SettingsItem>

      <Separator />

      {/* Row 2: Animations Toggle */}
      <SettingsItem
        label="Accent Color"
        description="Choose your preferred accent color."
      >
        <NativeSelect defaultValue={vibe} onChange={handleVibeChange}>
          <NativeSelectOption value="neutral">Neutral</NativeSelectOption>
          <NativeSelectOption value="mocha">Mocha</NativeSelectOption>
          <NativeSelectOption value="pastel">Pastel</NativeSelectOption>
          <NativeSelectOption value="caffeine">Caffeine</NativeSelectOption>
          <NativeSelectOption value="catppuccin">Catppuccin</NativeSelectOption>
        </NativeSelect>
      </SettingsItem>
    </SettingsIsland>
  )
}
