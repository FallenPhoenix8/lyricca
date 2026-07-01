"use client"
import gsap from "gsap"
import {
  sourceColorFromImage,
  Hct,
  SchemeFidelity,
  MaterialDynamicColors,
  hexFromArgb,
  type DynamicColor,
} from "@material/material-color-utilities"
import {
  m3ExpressiveDuration,
  m3ExpressiveSpring,
} from "@/components/ui/constants"

// * Mark: - Constants
const SHADCN_VARIABLE_KEYS: (keyof ShadcnThemeVariables)[] = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--border",
  "--input",
  "--ring",
  "--sidebar",
  "--sidebar-foreground",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
  "--sidebar-accent",
  "--sidebar-accent-foreground",
  "--sidebar-border",
  "--sidebar-ring",
]

// * Mark: - Types

// Strictly typed M3 roles required for our shadcn mapping
export interface M3ThemeRoles {
  background: string
  onBackground: string
  surfaceContainerLow: string
  surfaceContainerHigh: string
  onSurface: string
  primary: string
  onPrimary: string
  secondaryContainer: string
  onSecondaryContainer: string
  surfaceVariant: string
  onSurfaceVariant: string
  surfaceContainerHighest: string
  outlineVariant: string
}

export type ShadcnThemeVariables = {
  "--background": string
  "--foreground": string

  "--card": string
  "--card-foreground": string

  "--popover": string
  "--popover-foreground": string

  "--primary": string
  "--primary-foreground": string

  "--secondary": string
  "--secondary-foreground": string

  "--muted": string
  "--muted-foreground": string

  "--accent": string
  "--accent-foreground": string

  "--border": string
  "--input": string
  "--ring": string

  // Sidebar
  "--sidebar": string
  "--sidebar-foreground": string
  "--sidebar-primary": string
  "--sidebar-primary-foreground": string
  "--sidebar-accent": string
  "--sidebar-accent-foreground": string
  "--sidebar-border": string
  "--sidebar-ring": string
}

// * Mark - M3 Theme creation logic

/**
 * Extracts the seed color from an image and returns a strictly typed M3 role object.
 * @param imageElement The image element to extract the seed color from.
 * @param isDark Whether the theme should be dark or light.
 */
export async function createM3Theme(
  imageElement: HTMLImageElement,
  isDark: boolean,
): Promise<M3ThemeRoles> {
  const seedColorInt = await sourceColorFromImage(imageElement)
  const contrastLevel = 0.0
  const scheme = new SchemeFidelity(
    Hct.fromInt(seedColorInt),
    isDark,
    contrastLevel,
  )

  const getHex = (role: DynamicColor) => hexFromArgb(role.getArgb(scheme))
  const colors = new MaterialDynamicColors()

  return {
    background: getHex(colors.background()),
    onBackground: getHex(colors.onBackground()),
    surfaceContainerLow: getHex(colors.surfaceContainerLow()),
    surfaceContainerHigh: getHex(colors.surfaceContainerHigh()),
    onSurface: getHex(colors.onSurface()),
    primary: getHex(colors.primary()),
    onPrimary: getHex(colors.onPrimary()),
    secondaryContainer: getHex(colors.secondaryContainer()),
    onSecondaryContainer: getHex(colors.onSecondaryContainer()),
    surfaceVariant: getHex(colors.surfaceVariant()),
    onSurfaceVariant: getHex(colors.onSurfaceVariant()),
    surfaceContainerHighest: getHex(colors.surfaceContainerHighest()),
    outlineVariant: getHex(colors.outlineVariant()),
  }
}

// * Mark: - Shadcn to M3 Mapping

/**
 * Maps the strictly typed M3 roles into shadcn CSS variables.
 */
export function transformM3ToShadcn(
  m3Theme: M3ThemeRoles,
): ShadcnThemeVariables {
  return {
    "--background": m3Theme.background,
    "--foreground": m3Theme.onBackground,

    "--card": m3Theme.surfaceContainerLow,
    "--card-foreground": m3Theme.onSurface,

    "--popover": m3Theme.surfaceContainerHigh,
    "--popover-foreground": m3Theme.onSurface,

    "--primary": m3Theme.primary,
    "--primary-foreground": m3Theme.onPrimary,

    "--secondary": m3Theme.secondaryContainer,
    "--secondary-foreground": m3Theme.onSecondaryContainer,

    "--muted": m3Theme.surfaceVariant,
    "--muted-foreground": m3Theme.onSurfaceVariant,

    "--accent": m3Theme.surfaceContainerHighest,
    "--accent-foreground": m3Theme.onSurface,

    "--border": m3Theme.outlineVariant,
    "--input": m3Theme.outlineVariant,
    "--ring": m3Theme.primary,

    // Sidebar
    "--sidebar": m3Theme.surfaceContainerLow,
    "--sidebar-foreground": m3Theme.onSurface,
    "--sidebar-primary": m3Theme.primary,
    "--sidebar-primary-foreground": m3Theme.onPrimary,
    "--sidebar-accent": m3Theme.surfaceContainerHighest,
    "--sidebar-accent-foreground": m3Theme.onSurface,
    "--sidebar-border": m3Theme.outlineVariant,
    "--sidebar-ring": m3Theme.primary,
  }
}

// * Mark: - GSAP Animation

/**
 * Smoothly morphs the CSS variables on the root document using GSAP.
 * @important
 * NEEDS `useM3Motion` to be called beforehand in order for easing function to be applied correctly.
 */
export function animateThemeTransitions(shadcnTheme: ShadcnThemeVariables) {
  gsap.to(document.documentElement, {
    ...shadcnTheme,
    duration: m3ExpressiveDuration.effect.slow.seconds,
    ease: m3ExpressiveSpring.effect.slow.gsap,
    overwrite: "auto",
  })
}

/**
 * Clears all dynamic variables from inline styles, reverting back to CSS stylesheet defaults.
 */
export function clearShadcnTheme() {
  const root = document.documentElement

  // * 1. Kill any active GSAP tweens targeting these variables to prevent visual flickering
  gsap.killTweensOf(root, SHADCN_VARIABLE_KEYS.join(","))

  // * 2. Remove the inline styles completely
  SHADCN_VARIABLE_KEYS.forEach((variable) => {
    root.style.removeProperty(variable)
  })
}
