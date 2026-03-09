import { startTransition, useEffect, useState, ViewTransition } from "react"
import { SongCardResponsiveClient } from "./song-card-responsive-client"
import { SkeletonSongCard } from "./song-card"
import { useSongsContext } from "./SongsContext"
import { useMemo } from "react"
import { useDebounce } from "use-debounce"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Search } from "lucide-react"
import { SongDTO } from "@shared/ts-types"
import { useQueryState } from "nuqs"

export function SongCardList() {
  // TODO: Add filter tags
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useQueryState("q", { defaultValue: "" })
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useDebounce(
    searchQuery,
    300,
  )
  const { songs, isLoading, count } = useSongsContext()

  const [songsToShow, setSongsToShow] = useState<SongDTO[]>([])
  useEffect(() => {
    startTransition(() => {
      if (filterTags.length === 0 && searchQuery === "")
        setSongsToShow([...songs])
      setSongsToShow(
        songs.filter((song) => {
          // * MARK: - Check if title, artist, or album matches query
          const isMatchesQuery: boolean =
            song.title
              .toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase()) ||
            !!song.artist
              ?.toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase()) ||
            !!song.album
              ?.toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase())
          // * MARK: - Check if tags match song's artist or album
          const isMatchesTags: boolean = filterTags.some((tag) => {
            const isArtistMatches = song.artist
              ?.toLowerCase()
              .includes(tag.toLowerCase())
            const isAlbumMatches = song.album
              ?.toLowerCase()
              .includes(tag.toLowerCase())
            return isArtistMatches || isAlbumMatches
          })
          return isMatchesQuery || isMatchesTags
        }),
      )
    })
  }, [songs, filterTags, debouncedSearchQuery])
  const countToShow = useMemo(() => {
    if (filterTags.length === 0 && searchQuery === "") return count
    return songsToShow.length
  }, [count, songsToShow])

  function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
    setDebouncedSearchQuery(event.target.value)
    setSearchQuery(event.target.value)
  }

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

  useEffect(() => {
    console.log("Search query changed:", debouncedSearchQuery)
  }, [debouncedSearchQuery])
  return (
    <>
      <InputGroup className="max-w-md mx-auto">
        <InputGroupInput
          placeholder="Search..."
          onChange={handleSearch}
          value={searchQuery}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          {countToShow && `${countToShow} results`}
        </InputGroupAddon>
      </InputGroup>

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
    </>
  )
}
