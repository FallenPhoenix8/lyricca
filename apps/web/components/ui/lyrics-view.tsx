import { EyeIcon, PenIcon } from "@phosphor-icons/react"
import AnimatedButtonGroup, { ButtonGroupItem } from "./animated-button-group"
import { HStack, Spacer, VStack } from "./layout"
import React, {
  Activity,
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  ViewTransition,
} from "react"
import { Skeleton } from "./skeleton"
import { cn } from "@/lib/utils"
import { easeOvershootClassName } from "./constants"
import { useDebouncedCallback } from "use-debounce"
import { Button } from "./button"
import {
  CheckIcon,
  Maximize2,
  Maximize2Icon,
  Minimize2Icon,
} from "lucide-react"
import Link from "next/link"

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
  isReadyTranslation = true,
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
  isReadyTranslation?: boolean
}) {
  const translatedElementRef = useRef<HTMLDivElement>(null)
  const originalElementRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!isEditable) {
      originalElementRef.current?.blur()
      translatedElementRef.current?.blur()
    }
  }, [isEditable])
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
        ref={originalElementRef}
      >
        {original}
      </div>
      {(isReadyTranslation || isEditable) && (
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
          ref={translatedElementRef}
        >
          {translated}
        </div>
      )}
      {!isReadyTranslation && !isEditable && (
        <Skeleton className="h-5 w-full rounded-xs px-2 py-1 ml-2" />
      )}
    </VStack>
  )
}

export function LyricsView({
  translatedLyrics,
  originalLyrics,
  handleLyricsChange,
  isLoading = false,
  isReadyTranslation = true,
  isEditable,
  setIsEditable,
  isMaximized = false,
  maximizedURL,
  minimizedURL,
}: {
  translatedLyrics: string[]
  originalLyrics: string[]
  handleLyricsChange: ({
    translatedLyrics,
    originalLyrics,
  }: {
    translatedLyrics: string
    originalLyrics: string
  }) => void
  isEditable: boolean
  setIsEditable: React.Dispatch<React.SetStateAction<boolean>>
  isLoading?: boolean
  isReadyTranslation?: boolean
  isMaximized?: boolean
  maximizedURL?: string
  minimizedURL?: string
}) {
  const skeletonLyricsPairs: null[] = new Array(20).fill(null)
  const [isFirstRender, setIsFirstRender] = useState(true)

  const buttons = useCallback(
    () =>
      [
        {
          role: "button",
          label: "View",
          icon: <EyeIcon className="h-5 w-5" />,
          isInitialActive: isEditable === false,
          onClick: () => {
            setIsEditable((prev) => !prev)
          },
        },
        {
          role: "button",
          label: "Edit",
          icon: <PenIcon className="w-5 h-5" />,
          isInitialActive: isEditable === true,
          onClick: () => {
            setIsEditable((prev) => !prev)
          },
        },
      ] satisfies ButtonGroupItem[],
    [isEditable],
  )

  const lyricsPairs: { translated: string; original: string }[] =
    originalLyrics.map((original, index) => ({
      translated: translatedLyrics[index] ?? "",
      original,
    }))

  const originalLyricsRef = useRef(originalLyrics.join("\n"))
  const translatedLyricsRef = useRef(translatedLyrics.join("\n"))

  function handleChangeSingleTranslatedLyrics(
    lineIndex: number,
    newLyrics: string,
  ) {
    const newLyricsArray = [...lyricsPairs]
    newLyricsArray[lineIndex].translated = newLyrics
    const newTranslatedLyrics = newLyricsArray.map((pair) =>
      pair.translated.replace("\n", "").replace("\r", ""),
    )
    translatedLyricsRef.current = newTranslatedLyrics.join("\n")
  }

  function handleChangeSingleOriginalLyrics(
    lineIndex: number,
    newLyrics: string,
  ) {
    const newLyricsArray = [...lyricsPairs]
    newLyricsArray[lineIndex].original = newLyrics
    const newOriginalLyrics = newLyricsArray.map((pair) =>
      pair.original.replace("\n", "").replace("\r", ""),
    )
    originalLyricsRef.current = newOriginalLyrics.join("\n")
  }

  const debouncedHandleChangeSingleTranslatedLyrics = useDebouncedCallback(
    handleChangeSingleTranslatedLyrics,
    500,
  )
  const debouncedHandleChangeSingleOriginalLyrics = useDebouncedCallback(
    handleChangeSingleOriginalLyrics,
    500,
  )

  function handleSubmitNewLyrics() {
    handleLyricsChange({
      translatedLyrics:
        translatedLyricsRef.current || translatedLyrics.join("\n"),
      originalLyrics: originalLyricsRef.current || originalLyrics.join("\n"),
    })
  }

  useEffect(() => {
    console.log("translatedLyricsRef changed:", translatedLyricsRef.current)
  }, [translatedLyricsRef])

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false)
    } else {
      handleSubmitNewLyrics()
    }
  }, [isEditable])
  return (
    <ViewTransition name="lyrics-view">
      <VStack
        className={cn(
          "relative px-4 py-2 shadow-lg drop-shadow-card-foreground gap-0.5 mx-auto w-full",
          easeOvershootClassName,
          isMaximized && "fixed inset-0 z-100",
        )}
      >
        <div
          className={cn(
            "absolute bg-card rounded-xl inset-0 -z-20 transition-[border-radius]",
            easeOvershootClassName,
            isMaximized && "rounded-none",
          )}
        ></div>
        <HStack className="gap-2 w-full" alignItems="center">
          <h3 className="text-xl font-extrabold">Lyrics</h3>
          <Spacer />
          <AnimatedButtonGroup buttons={buttons()} />

          <Activity mode={isEditable ? "visible" : "hidden"}>
            <Button
              variant="secondary"
              onClick={(e) => {
                e.preventDefault()
                startTransition(() => {
                  setIsEditable(false)
                })
                handleSubmitNewLyrics()
              }}
              type="button"
            >
              <CheckIcon />
            </Button>
          </Activity>

          <Activity
            mode={
              !isEditable && maximizedURL && minimizedURL ? "visible" : "hidden"
            }
          >
            <Button variant="secondary" type="button">
              {isMaximized ? (
                <Link href={minimizedURL!}>
                  <Minimize2Icon />
                </Link>
              ) : (
                <Link href={maximizedURL!}>
                  <Maximize2Icon />
                </Link>
              )}
            </Button>
          </Activity>
        </HStack>
        <hr className="border-white" />
        <VStack
          className={cn(
            "gap-5 py-4 h-162.5 overflow-y-auto w-full",
            easeOvershootClassName,
            isMaximized && "h-full",
          )}
        >
          {!isLoading &&
            lyricsPairs.map((pair, index) => {
              return (
                <LyricsPair
                  key={`lyrics-pair-${index}`}
                  {...pair}
                  index={index}
                  isEditable={isEditable}
                  handleTranslatedLyricsChange={
                    handleChangeSingleTranslatedLyrics
                  }
                  handleOriginalLyricsChange={handleChangeSingleOriginalLyrics}
                  isReadyTranslation={isReadyTranslation}
                />
              )
            })}
          {isLoading &&
            skeletonLyricsPairs.map((_, index) => (
              <SkeletonLyricsPair key={`skeleton-lyrics-pair-${index}`} />
            ))}
        </VStack>
      </VStack>
    </ViewTransition>
  )
}
