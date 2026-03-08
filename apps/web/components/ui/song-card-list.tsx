import { ViewTransition } from "react"
import { SongCardResponsiveClient } from "./song-card-responsive-client"
import { SkeletonSongCard } from "./song-card"
import { useSongsContext } from "./SongsContext"
import { useMemo } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function SongCardList() {
  const { songs, isLoading, count } = useSongsContext()
  const songsToShow = useMemo(() => songs, [songs])
  const countToShow = useMemo(() => count, [count])

  const skeletonCards: null[] = new Array(10).fill(null)

  const noResultsHeadingContent =
    count === 0 ? <>No songs found</> : <>No results found</>
  const noResultsParagraphContent =
    count === 0 ? (
      <>
        <span>You can add a new song </span>
        <Link href="/app/add" className="underline-offset-2 underline">
          here
        </Link>
      </>
    ) : (
      <>Try searching for something else.</>
    )
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 place-items-center my-3 mx-auto",
        countToShow === 0 && "justify-center",
      )}
    >
      <ViewTransition>
        {!isLoading &&
          songsToShow.length !== 0 &&
          countToShow !== 0 &&
          songsToShow.map((song) => (
            <SongCardResponsiveClient
              key={song.id}
              song={song}
              className="h-full"
            />
          ))}
      </ViewTransition>
      {!isLoading && countToShow === 0 && (
        <div>
          <h1 className="text-center text-xl font-bold">
            {noResultsHeadingContent}
          </h1>
          <p className="text-center font-semibold text-muted-foreground">
            {noResultsParagraphContent}
          </p>
        </div>
      )}
      {isLoading &&
        skeletonCards.map((_, index) => (
          <SkeletonSongCard key={`skeleton-card-${index}`} />
        ))}
    </div>
  )
}
