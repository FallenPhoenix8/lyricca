"use client"
import { useState, useCallback, useEffect } from "react"
import {
  createM3Theme,
  transformM3ToShadcn,
  animateThemeTransitions,
  clearShadcnTheme,
} from "@/lib/client/theme-engine"
import { useM3Motion } from "./useM3Motion"
import { usePathname } from "next/navigation"

export function useDynamicTheme() {
  useM3Motion()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const pathname = usePathname()
  const dynamicThemePathPrefixes = ["/app/library/[songId]", "/app/add"]

  useEffect(() => {
    if (document === undefined) return
    for (const prefix of dynamicThemePathPrefixes) {
      if (!pathname.startsWith(prefix)) {
        clearShadcnTheme()
      }
    }
  }, [pathname])

  const applyThemeFromImage = useCallback(
    async (imageElement: HTMLImageElement | null) => {
      if (!imageElement) return
      if (document === undefined) return
      if (!window) return

      setIsProcessing(true)
      setError(null)

      try {
        // 1. Determine dark mode dynamically based on the HTML element's class
        const isDark = document.documentElement.className.includes("dark")

        // 2. Extract strictly-typed M3 Theme
        const m3Theme = await createM3Theme(imageElement, isDark)

        // 3. Transform to shadcn compatible object
        const shadcnTheme = transformM3ToShadcn(m3Theme)
        console.log("Current Shadcn Theme", shadcnTheme)

        // 4. Animate the transition via GSAP
        animateThemeTransitions(shadcnTheme)
      } catch (err) {
        console.error("Failed to extract and apply dynamic theme:", err)
        setError(
          err instanceof Error
            ? err
            : new Error("Unknown theme generation error"),
        )
      } finally {
        setIsProcessing(false)
      }
    },
    [],
  )

  const setDefaultTheme = useCallback(() => {
    if (document === undefined) return
    clearShadcnTheme()
  }, [])

  return { applyThemeFromImage, isProcessing, error, setDefaultTheme }
}
