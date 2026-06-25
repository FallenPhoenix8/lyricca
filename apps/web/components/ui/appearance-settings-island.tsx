"use client"
import { Separator } from "./separator"
import { NativeSelect, NativeSelectOption } from "./native-select"
import { SettingsIsland } from "./settings-island"
import { SettingsItem } from "./settings-item"
import { useTheme } from "next-themes"
import { useMemo } from "react"

export function AppearanceSettingsIsland() {
  const { setTheme, resolvedTheme } = useTheme()
  function handleModeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const newMode = event.target.value
    setTheme(newMode)
  }

  return (
    <SettingsIsland title="Appearance">
      {/* Row 1: Theme Selection */}
      <SettingsItem
        label="Theme"
        description="Select your preferred interface style."
      >
        <NativeSelect value={resolvedTheme} onChange={handleModeChange}>
          <NativeSelectOption value="light">Light</NativeSelectOption>
          <NativeSelectOption value="dark">Dark</NativeSelectOption>
        </NativeSelect>
      </SettingsItem>

      <Separator />

      {/* Row 2: Animations Toggle */}
      {/* <SettingsItem
        label="Accent Color"
        description="Choose your preferred accent color."
      >
        <NativeSelect value={vibe} onChange={handleVibeChange}>
          <NativeSelectOption value="neutral">Neutral</NativeSelectOption>
          <NativeSelectOption value="mocha">Mocha</NativeSelectOption>
          <NativeSelectOption value="pastel">Pastel</NativeSelectOption>
          <NativeSelectOption value="caffeine">Caffeine</NativeSelectOption>
          <NativeSelectOption value="catppuccin">Catppuccin</NativeSelectOption>
        </NativeSelect>
      </SettingsItem> */}
    </SettingsIsland>
  )
}
