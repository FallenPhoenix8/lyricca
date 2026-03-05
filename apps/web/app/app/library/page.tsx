"use client"
import { HStack } from "@/components/ui/layout"
import { SongCard } from "@/components/ui/song-card"
import { useSongs } from "@/lib/client/hook/useSongs"
import { useEffect } from "react"

export default function LibraryPage() {
  const { songs } = useSongs()

  useEffect(() => {
    console.log(songs)
  }, [songs])
  return (
    <>
      <HStack>
        <h2 className="app-title-heading">Library</h2>
      </HStack>
      <div className="grid grid-cols-(--auto-fit-cols) gap-2 place-items-center">
        {songs &&
          songs.map((song) => (
            <SongCard key={song.id} song={song} className="h-full" />
          ))}
      </div>
    </>
  )
}
