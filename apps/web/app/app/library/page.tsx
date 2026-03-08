"use client"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { HStack } from "@/components/ui/layout"
import { SkeletonSongCard } from "@/components/ui/song-card"
import { SongCardResponsiveClient } from "@/components/ui/song-card-responsive-client"
import { useSongsContext } from "@/components/ui/SongsContext"
import { useSongs } from "@/lib/client/hook/useSongs"
import { useWindowDimensions } from "@/lib/client/hook/useWindowDimensions"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ViewTransition } from "react"

export default function LibraryPage() {
  const { songs, isLoading, count } = useSongsContext()
  const songsToShow = useMemo(() => songs, [songs])

  const skeletonCards: null[] = new Array(10).fill(null)

  return (
    <>
      <Breadcrumb className="my-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Library</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-wrap gap-2 place-items-center my-3 mx-auto">
        <ViewTransition>
          {!isLoading &&
            count !== 0 &&
            songsToShow.map((song) => (
              <SongCardResponsiveClient
                key={song.id}
                song={song}
                className="h-full"
              />
            ))}
        </ViewTransition>

        {isLoading &&
          skeletonCards.map((_, index) => (
            <SkeletonSongCard key={`skeleton-card-${index}`} />
          ))}
      </div>
    </>
  )
}
