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
import { use, useMemo, ViewTransition } from "react"
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

export default function SongLyricsPage() {
  const { songId } = useParams<{ songId: string }>()

  const { findOneLocally, update, isLoading, songs } = useSongsContext()
  const song = findOneLocally(songId)

  if (song === null && !isLoading && songs.length !== 0) {
    redirect(`/app/library`)
  }

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

  const debouncedUpdateTranslatedLyrics = useDebouncedCallback(
    updateTranslatedLyrics,
    1000,
  )
  const debouncedUpdateOriginalLyrics = useDebouncedCallback(
    updateOriginalLyrics,
    1000,
  )

  return (
    <>
      <Breadcrumb className="my-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/app/library">Library</Link>
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
              src={song?.cover?.url ?? "/default-cover.png"}
              alt={song?.title ?? ""}
              className="w-full aspect-video md:aspect-square object-cover rounded-xl border-2"
              width={330}
              height={180}
            />
          </ViewTransition>
        </div>
        <div className="col-span-12 md:col-span-8 row-span-2 md:col-start-5">
          <VStack className="pl-4 gap-4">
            <VStack className="gap-1">
              <ViewTransition name={`${songId}-title`}>
                <h2 className="app-title-heading mt-3">{song?.title ?? ""}</h2>
                {isLoading && <Skeleton className="h-8 w-[50vw] rounded-sm" />}
              </ViewTransition>
              <HStack className="gap-2">
                {song ? (
                  <Badge variant="secondary">
                    {song.artist ?? "Unknown Artist"}
                  </Badge>
                ) : (
                  <Skeleton className="h-5 w-20 rounded-full" />
                )}
                {song ? (
                  <Badge variant="secondary">
                    {song.album ?? "Unknown Album"}
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
            />
          </VStack>
        </div>
      </div>
    </>
  )
}
