"use client"

import type { ComponentProps } from "react"
import { ThemeProvider as NextThemeProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemeProvider>) {
  const themeMap = {
    "neutral-light": "neutral-light",
    "neutral-dark": "neutral-dark",
    "mocha-light": "mocha-light",
    "mocha-dark": "mocha-dark",
    "pastel-light": "pastel-light",
    "pastel-dark": "pastel-dark",
    "caffeine-light": "caffeine-light",
    "caffeine-dark": "caffeine-dark",
    "catppuccin-light": "catppuccin-light",
    "catppuccin-dark": "catppuccin-dark",
  }
  return (
    <NextThemeProvider
      {...props}
      attribute="class"
      enableSystem={false}
      storageKey="theme"
      themes={[...Object.values(themeMap)]}
      value={themeMap}
      defaultTheme="neutral-dark"
    >
      {children}
    </NextThemeProvider>
  )
}
