"use client"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { HStack } from "@/components/ui/layout"
import { SongCard } from "@/components/ui/song-card"
import { useSongs } from "@/lib/client/hook/useSongs"
import Link from "next/link"
import { useEffect } from "react"

export default function LibraryPage() {
  const { songs } = useSongs()

  useEffect(() => {
    console.log(songs)
  }, [songs])
  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Library</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-wrap gap-2 place-items-center my-3">
        {songs &&
          songs.map((song) => (
            <SongCard key={song.id} song={song} className="h-full" />
          ))}
      </div>
    </>
  )
}
