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
    console.log("Successfully updated original lyrics.")
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
    console.log("Successfully updated translated lyrics.")
  }

  const debouncedUpdateTranslatedLyrics = useDebouncedCallback(
    updateTranslatedLyrics,
    1000,
  )
  const debouncedUpdateOriginalLyrics = useDebouncedCallback(
    updateOriginalLyrics,
    1000,
  )

  return song ? (
    <>
      <Breadcrumb>
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

      <ZStack className="block md:hidden">
        {song.cover ? (
          <Image
            src={song.cover.url}
            alt={song.title}
            width={330}
            height={180}
            className="w-full aspect-video object-cover rounded-xl"
          />
        ) : (
          <ImageRosetta className="h-96 rounded-xl" />
        )}
      </ZStack>

      <HStack>
        <VStack
          className="h-[90vh] max-w-sm hidden md:flex"
          justifyContent="center"
        >
          {song.cover ? (
            <Image
              src={song.cover.url}
              alt={song.title}
              width={384}
              height={384}
              className="h-96 aspect-square object-cover rounded-xl"
            />
          ) : (
            <ImageRosetta className="h-96 rounded-xl" />
          )}
        </VStack>
        <VStack className="pl-4 gap-4">
          <VStack className="gap-1">
            <h2 className="app-title-heading">{song.title}</h2>
            <HStack className="gap-2">
              <Badge variant="secondary">
                {song.artist ?? "Unknown Artist"}
              </Badge>
              <Badge variant="secondary">{song.album ?? "Unknown Album"}</Badge>
            </HStack>
          </VStack>
          <LyricsView
            translatedLyrics={translatedLyrics}
            originalLyrics={originalLyrics}
            handleTranslatedLyricsChange={debouncedUpdateTranslatedLyrics}
            handleOriginalLyricsChange={debouncedUpdateOriginalLyrics}
          />
        </VStack>
      </HStack>
    </>
  ) : (
    <div>Loading...</div>
  )
}
