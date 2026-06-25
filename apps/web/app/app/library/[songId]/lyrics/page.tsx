"use client"
import { BlurOverlay } from "@/components/ui/blur-overlay"
import { LyricsView } from "@/components/ui/lyrics-view"
import { useSongsContext } from "@/components/ui/SongsContext"
import { useDynamicTheme } from "@/lib/client/hook/useDynamicTheme"
import { usePreventEnterKey } from "@/lib/client/hook/usePreventEnterKey"
import { SongUpateSchema } from "@/lib/model/Song"
import { redirect, useParams } from "next/navigation"
import { useState } from "react"

export default function SongLyricsPage() {
  const { songId } = useParams<{ songId: string }>()
  const { applyThemeFromImage } = useDynamicTheme()

  const maximizedURL = `/app/library/${songId}/lyrics`
  const minimizedURL = `/app/library/${songId}`
  const { findOneLocally, update, isLoading, songs } = useSongsContext()
  const song = findOneLocally(songId)

  if (song === null && !isLoading && songs.length !== 0) {
    redirect(`/app/library`)
  }

  const [isEditable, setIsEditable] = useState(false)

  function updateLyrics({
    translatedLyrics,
    originalLyrics,
  }: {
    translatedLyrics: string
    originalLyrics: string
  }) {
    console.log("Updating lyrics...")
    try {
      const input = SongUpateSchema.assert({
        translated_lyrics: translatedLyrics,
        original_lyrics: originalLyrics,
      })
      update.mutate({ id: songId, input })
    } catch (error) {
      console.error("Failed to update lyrics:", error)
      return
    }
  }

  usePreventEnterKey(
    document.body,
    () => {
      setIsEditable(false)
    },
    [],
  )

  return (
    <>
      <img
        src={song?.cover?.url || "/cover-default.svg"}
        alt={song?.title}
        className="absolute w-full aspect-square opacity-0 -z-100"
        onLoad={(e) => {
          const target = e.target as HTMLImageElement
          applyThemeFromImage(target)
        }}
        crossOrigin="anonymous"
      />
      <BlurOverlay className="z-89" />
      <div
        className="fixed inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url("${song?.cover?.url || "/cover-default.svg"}")`,
        }}
      ></div>
      <LyricsView
        translatedLyrics={song?.translated_lyrics.split("\n") ?? []}
        originalLyrics={song?.original_lyrics.split("\n") ?? []}
        handleLyricsChange={updateLyrics}
        isEditable={isEditable}
        setIsEditable={setIsEditable}
        isLoading={isLoading}
        isMaximized={true}
        maximizedURL={maximizedURL}
        minimizedURL={minimizedURL}
      />
    </>
  )
}
