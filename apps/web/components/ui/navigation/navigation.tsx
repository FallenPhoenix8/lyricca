"use client"
import { HStack, Spacer } from "../layout"
import NavLinks from "./nav-links"
import { LogoFull } from "../svg/LogoFull"
import Link from "next/link"
import {
  startTransition,
  useLayoutEffect,
  useMemo,
  ViewTransition,
} from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CaretLeftIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { useQueryState } from "nuqs"
import { overlayBlurClassName } from "../blur-overlay"

export default function Navigation({ origin }: { origin: "app" | "guest" }) {
  const pathname = usePathname()

  const isHidden = useMemo(() => {
    const isPathSongLyricsPage = pathname.endsWith("/lyrics")
    return isPathSongLyricsPage
  }, [pathname])

  return (
    <ViewTransition name="navigation">
      <nav
        className={cn(
          "flex justify-start items-center sticky z-50 top-0 px-2 py-2 w-full font-heading",
          isHidden && "-translate-y-full",
          origin === "guest" && "bg-background/50 backdrop-blur-2xl",
        )}
      >
        <NavLinks origin={origin} />
      </nav>
    </ViewTransition>
  )
}
