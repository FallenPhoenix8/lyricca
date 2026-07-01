"use client"
import { BlurOverlay } from "@/components/ui/blur-overlay"
import { LyricsView } from "@/components/ui/lyrics-view"
import { useSongsContext } from "@/components/ui/SongsContext"
import { useDynamicTheme } from "@/lib/client/hook/useDynamicTheme"
import { usePreventEnterKey } from "@/lib/client/hook/usePreventEnterKey"
import { SongUpateSchema } from "@/lib/model/Song"
import { redirect, useParams } from "next/navigation"
import { createRef, useEffect, useLayoutEffect, useRef, useState } from "react"

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
  const body = useRef<HTMLBodyElement>(null)
  const [originalLyrics, setOriginalLyrics] = useState<string[]>([])
  const [translatedLyrics, setTranslatedLyrics] = useState<string[]>([])
  useEffect(() => {
    if (!song) return
    setOriginalLyrics(song.original_lyrics.split("\n"))
    setTranslatedLyrics(song.translated_lyrics.split("\n"))
  }, [song])

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
  function handleDeletePair(index: number) {
    const newOriginalLyrics: string[] = originalLyrics.filter(
      (_, i) => i !== index,
    )
    setOriginalLyrics(newOriginalLyrics)
    const newTranslatedLyrics: string[] = translatedLyrics.filter(
      (_, i) => i !== index,
    )
    setTranslatedLyrics(newTranslatedLyrics)
  }

  function handleAddPair() {
    const newOriginalLyrics: string[] = originalLyrics.concat("")
    setOriginalLyrics(newOriginalLyrics)
    const newTranslatedLyrics: string[] = translatedLyrics.concat("")
    setTranslatedLyrics(newTranslatedLyrics)
  }

  usePreventEnterKey(body, () => {
    setIsEditable(false)
  }, [])

  return (
    <>
      <img
        src={song?.cover?.url || "/cover-default.svg"}
        alt={song?.title}
        className="fixed h-full -z-100"
        onLoad={(e) => {
          const target = e.target as HTMLImageElement
          applyThemeFromImage(target)
        }}
        loading="eager"
        crossOrigin="anonymous"
      />
      {/* <div className="absolute inset-0 -z-90 bg-background"></div> */}
      <BlurOverlay className="z-89" />
      <div
        className="fixed inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url("${song?.cover?.url || "/cover-default.svg"}")`,
        }}
      ></div>
      <LyricsView
        translatedLyrics={translatedLyrics}
        originalLyrics={originalLyrics}
        handleLyricsChange={updateLyrics}
        handleAddPair={handleAddPair}
        handleDeletePair={handleDeletePair}
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
