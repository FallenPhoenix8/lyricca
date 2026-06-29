"use client"
import { Separator } from "./separator"
import { NativeSelect, NativeSelectOption } from "./native-select"
import { SettingsIsland } from "./settings-island"
import { SettingsItem } from "./settings-item"
import { useTheme } from "next-themes"
import { useEffect, useMemo, useState } from "react"
import { SettingsGroup } from "./settings/SettingsGroup"
import { Switch } from "./switch"
import { Button } from "./button"
import { InputRadio } from "./input-radio"
import { Palette } from "lucide-react"

export function AppearanceSettingsIsland() {
  const { setTheme, resolvedTheme, theme } = useTheme()
  const isThemeSystem = theme === "system"

  return (
    <SettingsGroup
      items={[
        {
          isLink: false,
          title: "Sync with system",
          description: "Sync your theme with your system theme.",
          icon: "settings",
          children: (
            <Switch
              isChecked={isThemeSystem}
              onCheckedChange={() => {
                if (theme === "system") {
                  setTheme(resolvedTheme || "dark")
                } else {
                  setTheme("system")
                }
              }}
              size="lg"
            />
          ),
        },
        {
          title: "Theme",
          isLink: false,
          description: "Set your preferred theme.",
          icon: "palette",
          isDisabled: isThemeSystem,
          variant: "vertical",
          children: (
            <div>
              <div className="flex items-center gap-2 font-semibold">
                {resolvedTheme && (
                  <InputRadio
                    name="theme"
                    value="dark"
                    activeValue={resolvedTheme}
                    setActiveValue={setTheme}
                    disabled={isThemeSystem}
                  />
                )}
                <div>Dark Theme</div>
              </div>
              <div className="flex items-center gap-2 font-semibold">
                {resolvedTheme && (
                  <InputRadio
                    name="theme"
                    value="light"
                    activeValue={resolvedTheme}
                    setActiveValue={setTheme}
                    disabled={isThemeSystem}
                  />
                )}
                <div>Light Theme</div>
              </div>
            </div>
          ),
        },
      ]}
    >
      <div className="flex gap-2 items-center">
        <Palette className="h-full aspect-square" />
        <div>Appearance</div>
      </div>
    </SettingsGroup>
  )
}
