"use client"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { HStack, VStack } from "@/components/ui/layout"
import Link from "next/link"
import {
  startTransition,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  ViewTransition,
} from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { LyricsView } from "@/components/ui/lyrics-view"
import { SongUpateSchema } from "@/lib/model/Song"
import { Skeleton } from "@/components/ui/skeleton"
import { useSongsContext } from "@/components/ui/SongsContext"
import { redirect } from "next/navigation"
import { useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { useQueryState } from "nuqs"
import {
  m3ExpressiveDuration,
  m3ExpressiveSpring,
} from "@/components/ui/constants"
import { usePreventEnterKey } from "@/lib/client/hook/usePreventEnterKey"
import { SongUpdateDTO } from "@shared/ts-types"
import { useReferralSongContext } from "@/components/ui/ReferralSongContext"
import { useM3Motion } from "@/lib/client/hook/useM3Motion"
import { useDynamicTheme } from "@/lib/client/hook/useDynamicTheme"
import { BlurOverlay, overlayBlurClassName } from "@/components/ui/blur-overlay"

export default function SongDetailsPage() {
  useM3Motion()
  const { songId } = useParams<{ songId: string }>()
  const maximizedURL = `/app/library/${songId}/lyrics`
  const minimizedURL = `/app/library/${songId}`

  const { applyThemeFromImage } = useDynamicTheme()

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
  const { setReferralSongId } = useReferralSongContext()

  const [artist, setArtist] = useState<string | null>(song?.artist || null)
  const [album, setAlbum] = useState<string | null>(song?.album || null)
  const [originalLyrics, setOriginalLyrics] = useState<string[]>([])
  const [translatedLyrics, setTranslatedLyrics] = useState<string[]>([])

  useEffect(() => {
    if (!song) return
    setArtist(song.artist || null)
    setAlbum(song.album || null)
    setOriginalLyrics(song.original_lyrics.split("\n"))
    setTranslatedLyrics(song.translated_lyrics.split("\n"))
  }, [song])

  function handleAlbumChange(event: React.KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLDivElement
    if (target.textContent !== unknownAlbum) {
      setAlbum(target.textContent)
    }
  }

  function handleArtistChange(event: React.KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLDivElement
    if (target.textContent !== unknownArtist) {
      setArtist(target.textContent)
    }
  }

  function handleSongUpdateTransaction({
    translatedLyrics,
    originalLyrics,
  }: {
    translatedLyrics: string
    originalLyrics: string
  }) {
    console.log("Updating song...")
    try {
      const details: SongUpdateDTO = {}

      const titleElement = titleElementRef.current

      if (!titleElement) {
        return
      }

      const title = titleElement.textContent

      if (title.trim() !== song?.title) {
        details.title = title.trim()
      }
      if (artist !== null && artist?.trim() !== song?.artist) {
        details.artist = artist?.trim() || ""
      }

      if (album !== null && album?.trim() !== song?.album) {
        details.album = album?.trim() || ""
      }
      if (originalLyrics.trim() !== song?.original_lyrics) {
        details.original_lyrics = originalLyrics.trim()
      }
      if (translatedLyrics.trim() !== song?.translated_lyrics) {
        details.translated_lyrics = translatedLyrics.trim()
      }

      const input = SongUpateSchema.assert(details)
      update.mutate({ id: songId, input })

      // Optimistically update artist and album
      if (song) {
        song.artist = artist?.trim() ? artist : null
        song.album = album?.trim() ? album : null
      }
    } catch (error) {
      console.error("Failed to update song details:", error)
      return
    }
  }

  usePreventEnterKey(
    document.body,
    () => {
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
    },
    [isEditable],
  )
  return (
    <>
      {/* <ViewTransition default="auto"> */}

      <BlurOverlay className="z-0" />
      <div
        className="grid grid-cols-12 grid-rows-[200px 200px] gap-4 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: `url("${song?.cover?.url || "/cover-default.svg"}")`,
        }}
      >
        <div className="col-span-12 md:col-span-4 row-span-1 md:h-1/2 flex justify-center items-center">
          <ViewTransition
            name={`${songId}-cover`}
            share="song-cover-details"
            update="song-cover"
          >
            <Image
              src={song?.cover?.url || "/cover-default.svg"}
              alt={song?.title || ""}
              className="w-full md:w-1/2 aspect-square object-cover md:rounded-xl md:border-2 bg-accent animate-pulse absolute top-0 left-0"
              onLoad={(event) => {
                const target = event.target as HTMLImageElement
                target.classList.remove("animate-pulse")
                if (!window) return
                applyThemeFromImage(target)
              }}
              loading="eager"
              width={330}
              height={180}
            />
          </ViewTransition>
        </div>
        <ViewTransition name="content">
          <div
            className={cn(
              "col-span-12 md:col-span-8 row-span-2 md:col-start-5 mt-[40vw] md:mt-10 z-20 rounded-t-2xl pb-2 md:pb-4 rounded-b-sm shadow-md shadow-border/50",
              overlayBlurClassName,
            )}
          >
            <VStack className="px-2 md:px-4 gap-4">
              <VStack className="gap-1">
                <Breadcrumb className="my-2">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link
                          href={`/app/library?q=${encodeURIComponent(searchParams)}`}
                          onNavigate={() => {
                            setReferralSongId(songId)
                          }}
                        >
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
                <ViewTransition
                  name={`${songId}-title`}
                  share="song-card-title"
                >
                  <div
                    className={cn(
                      "app-title-heading mt-3 min-w-1 px-2 bg-transparent border-0 rounded-xs transition-[border-color, border-radius, border-width, outline] outline-0",
                      m3ExpressiveDuration.effect.fast.className,
                      m3ExpressiveSpring.effect.fast.className,
                      isEditable &&
                        "rounded-sm border-2 border-accent cursor-text bg-input focus:outline-2",
                    )}
                    contentEditable={isEditable}
                    tabIndex={isEditable ? 0 : -1}
                    suppressContentEditableWarning
                    ref={titleElementRef}
                  >
                    {song?.title || ""}
                  </div>
                  {isLoading && (
                    <Skeleton className="h-8 w-[50vw] rounded-sm" />
                  )}
                </ViewTransition>
                <HStack className="gap-2">
                  {song ? (
                    <Badge
                      variant="secondary"
                      contentEditable={isEditable}
                      tabIndex={isEditable ? 0 : -1}
                      suppressContentEditableWarning
                      className={cn(
                        "min-w-1 px-2 py-1 border-0 transition-[border-color, border-radius, border-width, outline] outline-0",
                        m3ExpressiveDuration.effect.fast.className,
                        m3ExpressiveSpring.effect.fast.className,
                        isEditable &&
                          "rounded-sm border-2 border-accent cursor-text bg-input focus:outline-2",
                      )}
                      onKeyUp={handleArtistChange}
                      ref={artistElementRef}
                    >
                      {isEditable
                        ? song.artist || ""
                        : artist?.trim() || unknownArtist}
                    </Badge>
                  ) : (
                    <Skeleton className="h-5 w-20 rounded-full" />
                  )}
                  {song ? (
                    <Badge
                      variant="secondary"
                      contentEditable={isEditable}
                      tabIndex={isEditable ? 0 : -1}
                      suppressContentEditableWarning
                      className={cn(
                        "min-w-1 px-2 py-1 border-0 transition-[border-color, border-radius, border-width, outline] outline-0",
                        m3ExpressiveDuration.effect.fast.className,
                        m3ExpressiveSpring.effect.fast.className,
                        isEditable &&
                          "rounded-sm border-2 border-accent cursor-text bg-input focus:outline-2",
                      )}
                      onKeyUp={handleAlbumChange}
                      ref={albumElementRef}
                    >
                      {isEditable ? song.album || "" : album || unknownAlbum}
                    </Badge>
                  ) : (
                    <Skeleton className="h-5 w-24 rounded-full" />
                  )}
                </HStack>
              </VStack>
              <LyricsView
                translatedLyrics={translatedLyrics}
                originalLyrics={originalLyrics}
                handleLyricsChange={handleSongUpdateTransaction}
                isLoading={isLoading}
                isEditable={isEditable}
                setIsEditable={setIsEditable}
                maximizedURL={maximizedURL}
                minimizedURL={minimizedURL}
              />
            </VStack>
          </div>
        </ViewTransition>
      </div>
      {/* </ViewTransition> */}
    </>
  )
}
