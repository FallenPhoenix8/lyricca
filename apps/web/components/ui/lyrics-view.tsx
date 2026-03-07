import { EyeIcon, PenIcon } from "@phosphor-icons/react"
import AnimatedButtonGroup, { ButtonGroupItem } from "./animated-button-group"
import { HStack, Spacer, VStack } from "./layout"
import { useCallback, useLayoutEffect, useMemo, useState } from "react"
import { Skeleton } from "./skeleton"
import { cn } from "@/lib/utils"
import { easeOvershootClassName } from "./constants"

function SkeletonLyricsPair() {
  return (
    <VStack className="gap-1 px-4 w-full">
      <Skeleton className="h-4 w-3/4 rounded-xs px-2 py-1 mx-0.5" />
      <Skeleton className="h-4 w-3/4 rounded-xs px-2 py-1 mx-0.5" />
    </VStack>
  )
}

function LyricsPair({
  translated,
  original,
  index,
  handleTranslatedLyricsChange,
  handleOriginalLyricsChange,
  isEditable = false,
}: {
  translated: string
  original: string
  index: number
  handleTranslatedLyricsChange: (
    lineIndex: number,
    newTranslatedLyrics: string,
  ) => void
  handleOriginalLyricsChange: (
    lineIndex: number,
    newOriginalLyrics: string,
  ) => void
  isEditable?: boolean
}) {
  return (
    <VStack className="gap-1">
      <div
        className={cn(
          "text-foreground font-bold leading-4 px-2 bg-transparent py-1 border-0 rounded-xs transition-[border-color, border-radius, border-width, outline] duration-300 outline-0 mx-0.5",
          easeOvershootClassName,
          isEditable &&
            "rounded-sm border-2 border-accent cursor-text bg-input focus:outline-2",
        )}
        contentEditable={isEditable}
        tabIndex={isEditable ? 0 : -1}
        onInput={(event) => {
          const target = event.target as HTMLDivElement
          handleOriginalLyricsChange(index, target.textContent)
        }}
        suppressContentEditableWarning
      >
        {original}
      </div>
      <div
        className={cn(
          "text-muted-foreground font-bold leading-4 px-2 bg-transparent py-1 border-0 rounded-xs transition-[border-color, border-radius, border-width, outline] duration-300 outline-0 mx-0.5",
          easeOvershootClassName,
          isEditable &&
            "rounded-sm border-2 border-accent cursor-text bg-input focus:outline-2",
        )}
        contentEditable={isEditable}
        tabIndex={isEditable ? 0 : -1}
        onInput={(event) => {
          const target = event.target as HTMLDivElement
          handleTranslatedLyricsChange(index, target.textContent)
        }}
        suppressContentEditableWarning
      >
        {translated}
      </div>
    </VStack>
  )
}

export function LyricsView({
  translatedLyrics,
  originalLyrics,
  handleTranslatedLyricsChange,
  handleOriginalLyricsChange,
  isLoading = false,
}: {
  translatedLyrics: string[]
  originalLyrics: string[]
  handleTranslatedLyricsChange: (
    lineIndex: number,
    newTranslatedLyrics: string,
  ) => void
  handleOriginalLyricsChange: (
    lineIndex: number,
    newOriginalLyrics: string,
  ) => void
  isLoading?: boolean
}) {
  const [isEditable, setIsEditable] = useState(false)
  const skeletonLyricsPairs: null[] = new Array(20).fill(null)

  const buttons = useCallback(
    () =>
      [
        {
          role: "button",
          label: "View",
          icon: <EyeIcon className="h-5 w-5" />,
          isInitialActive: isEditable === false,
          onClick: () => {
            setIsEditable(false)
          },
        },
        {
          role: "button",
          label: "Edit",
          icon: <PenIcon className="w-5 h-5" />,
          isInitialActive: isEditable === true,
          onClick: () => {
            setIsEditable(true)
          },
        },
      ] satisfies ButtonGroupItem[],
    [isEditable],
  )

  useLayoutEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "enter") {
        event.preventDefault()
        setIsEditable(false)
      }
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isEditable])

  const lyricsPairs: { translated: string; original: string }[] =
    originalLyrics.map((original, index) => ({
      translated: translatedLyrics[index] ?? "",
      original,
    }))
  return (
    <VStack className="relative px-4 py-2 shadow-lg drop-shadow-card-foreground gap-0.5 mx-auto w-full">
      <div className="absolute bg-card rounded-xl inset-0 -z-20"></div>
      <HStack className="gap-2 w-full" alignItems="center">
        <h3 className="text-xl font-extrabold">Lyrics</h3>
        <Spacer />
        <AnimatedButtonGroup buttons={buttons()} />
      </HStack>
      <hr className="border-white" />
      <VStack className="gap-5 py-4 h-162.5 overflow-y-auto w-full">
        {!isLoading &&
          lyricsPairs.map((pair, index) => {
            return (
              <LyricsPair
                key={`lyrics-pair-${index}`}
                {...pair}
                index={index}
                isEditable={isEditable}
                handleTranslatedLyricsChange={handleTranslatedLyricsChange}
                handleOriginalLyricsChange={handleOriginalLyricsChange}
              />
            )
          })}
        {isLoading &&
          skeletonLyricsPairs.map((_, index) => (
            <SkeletonLyricsPair key={`skeleton-lyrics-pair-${index}`} />
          ))}
      </VStack>
    </VStack>
  )
}
