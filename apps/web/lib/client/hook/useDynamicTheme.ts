"use client"
import { useState, useCallback, useLayoutEffect } from "react"
import {
  createM3Theme,
  transformM3ToShadcn,
  animateThemeTransitions,
  clearShadcnTheme,
  ShadcnThemeVariables,
} from "@/lib/client/theme-engine"
import { useM3Motion } from "./useM3Motion"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"

/**
 * This hook uses the `createM3Theme` function to extract a strictly-typed M3 Theme from an HTML image element. It then transforms the M3 Theme into a Shadcn Theme and animates the transition using GSAP. The hook also provides a callback to apply the theme from an image element and a function to clear the Shadcn theme.
 * @returns An object containing the following properties:
 * - `applyThemeFromImage`: A function that takes an HTML image element and applies the theme from the image.
 * - `isProcessing`: A boolean indicating whether the theme is being processed.
 * - `error`: An optional error object if there was an error during the theme processing.
 * - `setDefaultTheme`: A function that clears the Shadcn theme.
 * @example
 * const { applyThemeFromImage } = useDynamicTheme()
 * applyThemeFromImage(imageElement)
 */
export function useDynamicTheme(): {
  applyThemeFromImage: (
    imageElement: HTMLImageElement | null,
  ) => Promise<ShadcnThemeVariables | null>
  isProcessing: boolean
  error: Error | null
  setDefaultTheme: () => void
} {
  useM3Motion()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isApplied, setIsApplied] = useState(false)
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const pathname = usePathname()
  const dynamicThemePathPrefixes = ["/app/library/[songId]", "/app/add"]
  const { resolvedTheme } = useTheme()

  useLayoutEffect(() => {
    if (document === undefined) return
    for (const prefix of dynamicThemePathPrefixes) {
      if (!pathname.startsWith(prefix)) {
        clearShadcnTheme()
      }
    }
    setIsApplied(false)
  }, [pathname])

  useLayoutEffect(() => {
    if (isApplied && sourceImage) {
      applyThemeFromImage(sourceImage)
    }
  }, [resolvedTheme])

  const applyThemeFromImage = useCallback(
    async (
      imageElement: HTMLImageElement | null,
    ): Promise<ShadcnThemeVariables | null> => {
      if (!imageElement) return null
      if (document === undefined) return null
      if (!window) return null

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
        setSourceImage(imageElement)
        return shadcnTheme
      } catch (err) {
        console.error("Failed to extract and apply dynamic theme:", err)
        setError(
          err instanceof Error
            ? err
            : new Error("Unknown theme generation error"),
        )
        return null
      } finally {
        setIsProcessing(false)
        setIsApplied(true)
      }
    },

    [resolvedTheme],
  )

  const setDefaultTheme = useCallback(() => {
    if (document === undefined) return
    clearShadcnTheme()
  }, [resolvedTheme])

  return { applyThemeFromImage, isProcessing, error, setDefaultTheme }
}
