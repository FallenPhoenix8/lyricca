import { EyeIcon, PenIcon } from "@phosphor-icons/react"
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
import { useDebounce, useDebouncedCallback } from "use-debounce"
import { Button } from "./button"
import {
  CheckIcon,
  Maximize2,
  Maximize2Icon,
  Minimize2Icon,
  PlusIcon,
  TrashIcon,
} from "lucide-react"
import Link from "next/link"
import { usePreventEnterKey } from "@/lib/client/hook/usePreventEnterKey"
import { m3ExpressiveDuration, m3ExpressiveSpring } from "./constants"
import { useM3Motion } from "@/lib/client/hook/useM3Motion"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { AnimatedButtonGroup, ButtonGroupItem } from "./animated-button-group"
import { Switch } from "./switch"
import { useWindowDimensions } from "@/lib/client/hook/useWindowDimensions"
import { QueryClient, QueryClientProvider, useQuery } from "react-query"
import { Romanization } from "@/lib/data/Romanization"
import { LoadingSpinner } from "./loading-spinner"

gsap.registerPlugin(useGSAP)

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
  isInteractive,
  handleTranslatedLyricsChange,
  handleOriginalLyricsChange,
  handleDelete,
  isEditable = false,
  isReadyTranslation = true,
}: {
  translated: string
  original: string
  index: number
  isInteractive: boolean
  handleTranslatedLyricsChange: (
    lineIndex: number,
    newTranslatedLyrics: string,
  ) => void
  handleOriginalLyricsChange: (
    lineIndex: number,
    newOriginalLyrics: string,
  ) => void
  handleDelete: (index: number) => void
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
  const sharedClassName =
    "font-bold leading-2 px-2 bg-transparent py-1 border-0 rounded-xs transition-[border-color, border-radius, border-width, outline] outline-0 text-lg md:text-xl md:font-extrabold"
  return (
    <HStack className="gap-2 items-center">
      {isInteractive && (
        <ViewTransition>
          <Button
            variant="outline"
            type="button"
            size="icon-lg"
            className={cn(
              "text-destructive h-full opacity-0 scale-x-0 origin-left",
              m3ExpressiveDuration.spatial.fast.className,
              m3ExpressiveSpring.spatial.fast.className,
              isEditable && "opacity-100 scale-x-100",
              !isEditable && "max-w-0",
            )}
            onClick={() => handleDelete(index)}
          >
            <TrashIcon strokeWidth="2px" />
          </Button>
        </ViewTransition>
      )}

      <div className="flex flex-col">
        <div
          className={cn(
            "text-foreground",
            sharedClassName,
            m3ExpressiveDuration.effect.fast.className,
            m3ExpressiveSpring.effect.fast.className,
            isEditable &&
              "rounded-sm border-2 border-accent cursor-text bg-input focus:outline-2",
          )}
          contentEditable={isEditable && isInteractive}
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
              "text-muted-foreground",
              sharedClassName,
              m3ExpressiveDuration.effect.fast.className,
              m3ExpressiveSpring.effect.fast.className,
              isEditable &&
                "rounded-sm border-2 border-accent cursor-text bg-input focus:outline-2 mt-1",
            )}
            contentEditable={isEditable && isInteractive}
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
      </div>
    </HStack>
  )
}

type LyricsViewProps = {
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
  handleDeletePair: (index: number) => void
  handleAddPair: () => void
  isLoading?: boolean
  isReadyTranslation?: boolean
  isMaximized?: boolean
  maximizedURL?: string
  minimizedURL?: string
  isPreventEnterKey?: boolean
  ref?: React.Ref<HTMLDivElement>
}

export function LyricsView(props: LyricsViewProps) {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <Content {...props} />
    </QueryClientProvider>
  )
}

function Content({
  translatedLyrics,
  originalLyrics,
  handleLyricsChange,
  handleDeletePair,
  handleAddPair,
  isLoading = false,
  isReadyTranslation = true,
  isEditable,
  setIsEditable,
  isMaximized = false,
  maximizedURL,
  minimizedURL,
  isPreventEnterKey = false,
  ref,
}: LyricsViewProps) {
  useM3Motion()

  const editButtonsRef = useRef<HTMLDivElement>(null)

  const skeletonLyricsPairs: null[] = new Array(20).fill(null)
  const [isFirstRender, setIsFirstRender] = useState(true)

  const lyricsContainerRef = useRef<HTMLDivElement>(null)

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
    } else if (!isEditable) {
      handleSubmitNewLyrics()
    }
  }, [isEditable])

  isPreventEnterKey &&
    usePreventEnterKey(lyricsContainerRef, () => {
      setIsEditable(false)
    }, [])

  const hasSpecialScript = useMemo(
    () => Romanization.shared.hasSpecialScript(originalLyrics.join("\n")),
    [originalLyrics],
  )
  const [isRomanized, setIsRomanized] = useState(false)
  const [debouncedOriginalLyrics] = useDebounce(originalLyrics, 500)
  const {
    data: romanizedLyrics = originalLyrics,
    isLoading: isLoadingRomanized,
  } = useQuery(
    ["romanized-lyrics", debouncedOriginalLyrics],
    () => Romanization.shared.romanizeLyrics(debouncedOriginalLyrics),
    {
      _defaulted: true,
      placeholderData: originalLyrics,
      initialData: originalLyrics,
    },
  )
  const romanizedLyricPairs = useMemo(
    () =>
      romanizedLyrics.map((original, index) => ({
        original,
        translated: translatedLyrics[index] || "",
      })),
    [romanizedLyrics, translatedLyrics],
  )

  function toggleIsRomanized() {
    setIsEditable(false)
    setIsRomanized((prev) => !prev)
  }

  useEffect(
    () => console.log("romanizedLyrics", romanizedLyrics),
    [romanizedLyrics],
  )
  return (
    <ViewTransition name="lyrics-view">
      <VStack
        className={cn(
          "relative px-4 py-2 gap-0.5 mx-auto w-full",
          m3ExpressiveDuration.effect.fast.className,
          m3ExpressiveSpring.effect.fast.className,
          isMaximized && "fixed inset-0 z-100",
        )}
        ref={ref}
      >
        <div
          className={cn(
            "absolute bg-secondary/90 rounded-xl inset-0 -z-20 transition-[border-radius] drop-shadow-sm drop-shadow-black/50",
            m3ExpressiveDuration.effect.fast.className,
            m3ExpressiveSpring.effect.fast.className,
            isMaximized && "rounded-none",
          )}
        ></div>
        <HStack className="gap-2 w-full" alignItems="center">
          <h3 className="text-xl font-extrabold font-heading">Lyrics</h3>
          <Spacer />
          {/* <AnimatedButtonGroup
            buttons={buttons()}
            className={cn(
              isEditable ? "mr-0" : "-mr-12",
              m3ExpressiveDuration.spatial.fast.className,
              m3ExpressiveSpring.spatial.fast.className,
            )}
          /> */}
          <div
            className={cn(
              "flex gap-2 transition-[margin]",
              m3ExpressiveDuration.spatial.fast.className,
              m3ExpressiveSpring.spatial.fast.className,
              isEditable ? "mr-0" : "-mr-12",
            )}
          >
            {hasSpecialScript && (
              <div className="flex gap-1">
                {isLoadingRomanized && <LoadingSpinner />}
                <Switch
                  size="lg"
                  isChecked={isRomanized}
                  onCheckedChange={toggleIsRomanized}
                  icon="languages"
                  disabled={isEditable || isLoadingRomanized}
                  activeIcon="letter-text"
                />
              </div>
            )}
            <Switch
              size="lg"
              isChecked={isEditable}
              onCheckedChange={setIsEditable}
              disabled={isRomanized}
              icon="eye"
              activeIcon="pencil-sparkles"
            />
          </div>
          <SubmitButton
            handleClick={(e) => {
              e.preventDefault()
              setIsEditable(false)
            }}
            isVisible={isEditable}
          />

          <Activity
            mode={
              !isEditable && maximizedURL && minimizedURL ? "visible" : "hidden"
            }
          >
            <Link href={isMaximized ? minimizedURL! : maximizedURL!}>
              <Button variant="secondary" type="button">
                {isMaximized ? <Minimize2Icon /> : <Maximize2Icon />}
              </Button>
            </Link>
          </Activity>
        </HStack>
        <hr className="border-white" />
        <VStack
          className={cn(
            "gap-4 py-4 h-162.5 overflow-y-auto w-full",
            m3ExpressiveDuration.effect.fast.className,
            m3ExpressiveSpring.effect.fast.className,
            isMaximized && "h-full",
          )}
          ref={lyricsContainerRef}
        >
          {!isLoading &&
            !isRomanized &&
            lyricsPairs.map((pair, index) => {
              return (
                <LyricsPair
                  key={`lyrics-pair-${index}`}
                  {...pair}
                  isInteractive
                  index={index}
                  isEditable={isEditable}
                  handleTranslatedLyricsChange={
                    handleChangeSingleTranslatedLyrics
                  }
                  handleOriginalLyricsChange={handleChangeSingleOriginalLyrics}
                  handleDelete={handleDeletePair}
                  isReadyTranslation={isReadyTranslation}
                />
              )
            })}
          {!isLoading &&
            isRomanized &&
            romanizedLyricPairs.map((pair, index) => {
              return (
                <LyricsPair
                  key={`lyrics-pair-${index}`}
                  {...pair}
                  isInteractive={false}
                  index={index}
                  isEditable={isEditable}
                  handleTranslatedLyricsChange={
                    handleChangeSingleTranslatedLyrics
                  }
                  handleOriginalLyricsChange={handleChangeSingleOriginalLyrics}
                  handleDelete={handleDeletePair}
                  isReadyTranslation={isReadyTranslation}
                />
              )
            })}
          {isLoading &&
            skeletonLyricsPairs.map((_, index) => (
              <SkeletonLyricsPair key={`skeleton-lyrics-pair-${index}`} />
            ))}
          {isEditable && (
            <Button
              size="lg"
              variant="outline"
              type="button"
              className="w-full"
              onClick={handleAddPair}
            >
              <PlusIcon strokeWidth="2px" />
            </Button>
          )}
        </VStack>
      </VStack>
    </ViewTransition>
  )
}

function SubmitButton(props: {
  handleClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  isVisible: boolean
}) {
  useM3Motion()
  const buttonRef = useRef<HTMLButtonElement>(null)
  useGSAP(() => {
    if (!buttonRef.current) return
    const tl = gsap.timeline()

    tl.to(buttonRef.current, {
      opacity: props.isVisible ? 1 : 0,
      scaleX: props.isVisible ? 1 : 0,
      duration: m3ExpressiveDuration.effect.fast.seconds,
      ease: m3ExpressiveSpring.effect.fast.gsap,
    })
  }, [props.isVisible])
  return (
    <Button
      variant="default"
      onClick={props.handleClick}
      type="button"
      ref={buttonRef}
      className="opacity-0 scale-0 origin-right"
    >
      <CheckIcon />
    </Button>
  )
}
