import { cn } from "@/lib/utils"
import { LowPolyGrid } from "./low-poly-grid"
import { overlayBlurClassName } from "../blur-overlay"

export function Footer() {
  return (
    <footer className="z-stack">
      <LowPolyGrid className="rotate-x-180" />
      <div className="flex flex-col justify-end">
        <p
          className={cn(
            "text-center text-sm z-20 drop-shadow-sm drop-shadow-background/50 my-4 mx-2 px-4 py-6 rounded-2xl border-4 border-border",
            overlayBlurClassName,
          )}
        >
          Lyricca is a hobby project made by Łukasz Kwiecień licensed under{" "}
          <a
            href="https://github.com/FallenPhoenix8/lyricca/blob/main/LICENSE"
            target="_blank"
            className="underline-offset-2 underline"
          >
            CC NY-BC 4.0
          </a>
          . You can find the source code on{" "}
          <a
            href="https://github.com/FallenPhoenix8/lyricca/"
            target="_blank"
            className="underline-offset-2 underline"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </footer>
  )
}
