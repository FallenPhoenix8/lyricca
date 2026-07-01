"use client"
import NavLinks from "./nav-links"
import { useMemo, ViewTransition } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

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
