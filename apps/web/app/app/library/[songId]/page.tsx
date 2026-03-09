"use client"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { HStack, Spacer, VStack, ZStack } from "@/components/ui/layout"
import { useSongs } from "@/lib/client/hook/useSongs"
import Link from "next/link"
import {
  startTransition,
  use,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  ViewTransition,
} from "react"
import Image from "next/image"
import { ImageRosetta } from "@/components/ui/svg/ImageRosetta"
import { Badge } from "@/components/ui/badge"
import { LyricsView } from "@/components/ui/lyrics-view"
import { SongUpateSchema } from "@/lib/model/Song"
import { useDebounce, useDebouncedCallback } from "use-debounce"
import { Skeleton } from "@/components/ui/skeleton"
import { PlaceholderImage } from "@/components/ui/svg/PlaceholderImage"
import { useSongsContext } from "@/components/ui/SongsContext"
import { redirect } from "next/navigation"
import { useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { useQueryState } from "nuqs"
import { easeOvershootClassName } from "@/components/ui/constants"

export default function SongLyricsPage() {
  const { songId } = useParams<{ songId: string }>()

  const unknownArtist = "Unknown Artist"
  const unknownAlbum = "Unknown Album"

  const titleElementRef = useRef<HTMLDivElement>(null)
  const artistElementRef = useRef<HTMLDivElement>(null)
  const albumElementRef = useRef<HTMLDivElement>(null)

  const [searchParams] = useQueryState("q", { defaultValue: "" })

  const { findOneLocally, update, isLoading, songs } = useSongsContext()
  const song = findOneLocally(songId)

  if (song === null && !isLoading && songs.length !== 0) {
    redirect(`/app/library`)
  }
  const [isEditable, setIsEditable] = useState(false)

  function updateTitle(newTitle: string, target: HTMLDivElement) {
    console.log(`Updating title to "${newTitle}"...`)
    update.mutate({ id: songId, input: { title: newTitle } })
    target.blur()
  }

  const [artist, setArtist] = useState<string | null>(song?.artist ?? null)
  function updateArtist(newArtist: string | null, target: HTMLDivElement) {
    console.log(`Updating artist to "${newArtist}"...`)
    startTransition(() => {
      setArtist(newArtist)
    })
    update.mutate({ id: songId, input: { artist: newArtist } })
    target.blur()
  }

  const [album, setAlbum] = useState<string | null>(song?.album ?? null)
  function updateAlbum(newAlbum: string | null, target: HTMLDivElement) {
    console.log(`Updating album to "${newAlbum}"...`)
    startTransition(() => {
      setAlbum(newAlbum)
    })
    update.mutate({ id: songId, input: { album: newAlbum } })
    target.blur()
  }
  useEffect(() => {
    startTransition(() => {
      setArtist(song?.artist ?? null)
      setAlbum(song?.album ?? null)
    })
  }, [song])

  const translatedLyrics = useMemo(() => {
    return song?.translated_lyrics.split("\n") ?? []
  }, [song])
  const originalLyrics = useMemo(() => {
    return song?.original_lyrics.split("\n") ?? []
  }, [song])

  function updateOriginalLyrics(lineIndex: number, newOriginalLyrics: string) {
    console.log("Updating original lyrics...")
    const newOriginalLyricsArray = [...originalLyrics]
    newOriginalLyricsArray[lineIndex] = newOriginalLyrics

    try {
      const input = SongUpateSchema.assert({
        original_lyrics: newOriginalLyricsArray.join("\n"),
      })
      update.mutate({ id: songId, input })
    } catch (error) {
      console.error("Failed to update original lyrics:", error)
      return
    }
  }
  function updateTranslatedLyrics(
    lineIndex: number,
    newTranslatedLyrics: string,
  ) {
    console.log("Updating translated lyrics...")
    const newTranslatedLyricsArray = [...translatedLyrics]
    newTranslatedLyricsArray[lineIndex] = newTranslatedLyrics
    try {
      const input = SongUpateSchema.assert({
        translated_lyrics: newTranslatedLyricsArray.join("\n"),
      })
      update.mutate({ id: songId, input })
    } catch (error) {
      console.error("Failed to update translated lyrics:", error)
      return
    }
  }

  const debouncedUpdateTitle = useDebouncedCallback(updateTitle, 2000)
  function handleChangeTitle(event: React.FormEvent<HTMLDivElement>) {
    const { textContent } = event.target as HTMLDivElement
    if (textContent.length > 0) {
      debouncedUpdateTitle(textContent, event.target as HTMLDivElement)
    }
  }

  const debouncedUpdateArtist = useDebouncedCallback(updateArtist, 2000)
  function handleChangeArtist(event: React.FormEvent<HTMLDivElement>) {
    const target = event.target as HTMLDivElement
    const { textContent } = target

    const artist = textContent.trim() === "" ? null : textContent
    debouncedUpdateArtist(artist, target)
  }

  const debouncedUpdateAlbum = useDebouncedCallback(updateAlbum, 2000)
  function handleChangeAlbum(event: React.FormEvent<HTMLDivElement>) {
    const target = event.target as HTMLDivElement
    const { textContent } = target

    const album = textContent.trim() === "" ? null : textContent
    debouncedUpdateAlbum(album, target)
  }

  const debouncedUpdateTranslatedLyrics = useDebouncedCallback(
    updateTranslatedLyrics,
    1000,
  )
  const debouncedUpdateOriginalLyrics = useDebouncedCallback(
    updateOriginalLyrics,
    1000,
  )

  useLayoutEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "enter") {
        event.preventDefault()
        const titleElement = titleElementRef.current
        const artistElement = artistElementRef.current
        const albumElement = albumElementRef.current

        if (titleElement) {
          titleElement.blur()
        }
        if (artistElement) {
          artistElement.blur()
        }
        if (albumElement) {
          albumElement.blur()
        }
        setIsEditable(false)
      }
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isEditable])

  return (
    <>
      {/* <ViewTransition default="auto"> */}
      <Breadcrumb className="my-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/app/library?q=${encodeURIComponent(searchParams)}`}>
                Library
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Lyrics</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid grid-cols-12 grid-rows-[200px 200px] gap-4">
        <div className="col-span-12 md:col-span-4 row-span-1 md:h-screen flex justify-center items-center">
          <ViewTransition name={`${songId}-cover`}>
            <Image
              src={song?.cover?.url ?? "/empty.png"}
              alt={song?.title ?? ""}
              className="w-full aspect-video md:aspect-square object-cover rounded-xl border-2 bg-accent animate-pulse"
              onLoad={(event) => {
                const target = event.target as HTMLImageElement
                target.classList.remove("animate-pulse")
              }}
              width={330}
              height={180}
            />
          </ViewTransition>
        </div>
        <div className="col-span-12 md:col-span-8 row-span-2 md:col-start-5">
          <VStack className="pl-4 gap-4">
            <VStack className="gap-1">
              <ViewTransition name={`${songId}-title`}>
                <div
                  className={cn(
                    "app-title-heading mt-3 min-w-1 px-2 bg-transparent py-1 border-0 rounded-xs transition-[border-color, border-radius, border-width, outline] duration-300 outline-0",
                    easeOvershootClassName,
                    isEditable &&
                      "rounded-sm border-2 border-accent cursor-text bg-input focus:outline-2",
                  )}
                  onInput={handleChangeTitle}
                  contentEditable={isEditable}
                  tabIndex={isEditable ? 0 : -1}
                  suppressContentEditableWarning
                  ref={titleElementRef}
                >
                  {song?.title ?? ""}
                </div>
                {isLoading && <Skeleton className="h-8 w-[50vw] rounded-sm" />}
              </ViewTransition>
              <HStack className="gap-2">
                {song ? (
                  <Badge
                    variant="secondary"
                    contentEditable={isEditable}
                    tabIndex={isEditable ? 0 : -1}
                    onInput={handleChangeArtist}
                    suppressContentEditableWarning
                    className={cn(
                      "min-w-1 px-2 py-1 border-0 transition-[border-color, border-radius, border-width, outline] duration-300 outline-0",
                      easeOvershootClassName,
                      isEditable &&
                        "rounded-sm border-2 border-accent cursor-text bg-input focus:outline-2",
                    )}
                    ref={artistElementRef}
                  >
                    {isEditable
                      ? (song.artist ?? "")
                      : (artist ?? unknownArtist)}
                  </Badge>
                ) : (
                  <Skeleton className="h-5 w-20 rounded-full" />
                )}
                {song ? (
                  <Badge
                    variant="secondary"
                    contentEditable={isEditable}
                    tabIndex={isEditable ? 0 : -1}
                    onInput={handleChangeAlbum}
                    suppressContentEditableWarning
                    className={cn(
                      "min-w-1 px-2 py-1 border-0 transition-[border-color, border-radius, border-width, outline] duration-300 outline-0",
                      easeOvershootClassName,
                      isEditable &&
                        "rounded-sm border-2 border-accent cursor-text bg-input focus:outline-2",
                    )}
                    ref={albumElementRef}
                  >
                    {isEditable ? (song.album ?? "") : (album ?? unknownAlbum)}
                  </Badge>
                ) : (
                  <Skeleton className="h-5 w-24 rounded-full" />
                )}
              </HStack>
            </VStack>
            <LyricsView
              translatedLyrics={translatedLyrics}
              originalLyrics={originalLyrics}
              handleTranslatedLyricsChange={debouncedUpdateTranslatedLyrics}
              handleOriginalLyricsChange={debouncedUpdateOriginalLyrics}
              isLoading={isLoading}
              isEditable={isEditable}
              setIsEditable={setIsEditable}
            />
          </VStack>
        </div>
      </div>
      {/* </ViewTransition> */}
    </>
  )
}
