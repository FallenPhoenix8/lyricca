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
import { use, useMemo } from "react"
import Image from "next/image"
import { ImageRosetta } from "@/components/ui/svg/ImageRosetta"
import { Badge } from "@/components/ui/badge"
import { LyricsView } from "@/components/ui/lyrics-view"
import { SongUpateSchema } from "@/lib/model/Song"
import { useDebounce, useDebouncedCallback } from "use-debounce"
import { Skeleton } from "@/components/ui/skeleton"

export default function SongLyricsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = use(params)
  const songId = slug[0]
  const { findOneLocally, update } = useSongs()
  const song = findOneLocally(songId)
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
  // song ? (
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
          {!song && (
            <Skeleton className="w-full aspect-video md:aspect-square rounded-xl border-2" />
          )}
          {song && song.cover && (
            <Image
              src={song.cover.url}
              alt={song.title}
              className="w-full aspect-video md:aspect-square object-cover rounded-xl border-2"
              width={330}
              height={180}
            />
          )}
          {song && !song.cover && (
            <div className="w-full aspect-video object-contain rounded-xl border-2">
              <ImageRosetta className="w-3/4 h-3/4 rounded-xl" />
            </div>
          )}
        </div>
        <div className="col-span-12 md:col-span-8 row-span-2 md:col-start-5">
          <VStack className="pl-4 gap-4">
            <VStack className="gap-1">
              {song ? (
                <h2 className="app-title-heading mt-3">{song.title}</h2>
              ) : (
                <Skeleton className="h-8 w-[50vw] mt-3" />
              )}
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
              isLoading={!song}
            />
          </VStack>
        </div>
      </div>
    </>
  )
}
