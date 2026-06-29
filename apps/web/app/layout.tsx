import type { Metadata } from "next"
import { Google_Sans_Flex, Noto_Sans } from "next/font/google"
import "./globals.css"
import React, { ViewTransition } from "react"
import { ThemeProvider } from "next-themes"
import { NuqsAdapter } from "nuqs/adapters/next"

const notoSans = Noto_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans",
})

const fontFamily = `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, var(--${notoSans.variable}), sans-serif`

const selfURL = process.env.SELF_URL
if (!selfURL) {
  throw new Error("SELF_URL environment variable is not set")
}

export const metadata: Metadata = {
  title: "Lyricca",
  description:
    "Upload lyrics of your favorite songs and translate them to your language.",
  keywords: "lyrics, lyric, song, music, translate, translation, lyricca",
  authors: {
    name: "Łukasz Kwiecień",
    url: "https://github.com/FallenPhoenix8",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    url: selfURL,
    title: "Lyricca",
    description:
      "Upload lyrics of your favorite songs and translate them to your language.",
    images: [
      {
        url: `${selfURL}/logo.svg`,
        width: 1200,
        height: 432,
        alt: "Lyricca Logo",
        type: "image/svg+xml",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`antialiased bg-secondary dark:bg-background`}
        style={{
          fontFamily,
        }}
      >
        <NuqsAdapter>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  )
}
