import {
  startTransition,
  use,
  useEffect,
  useState,
  ViewTransition,
} from "react"
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
import {
  ArrowDownAZ,
  ArrowDownZA,
  MoreHorizontalIcon,
  Search,
  X,
} from "lucide-react"
import { SongDTO } from "@shared/ts-types"
import { useQueryState } from "nuqs"
import { ButtonGroup } from "./button-group"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import { HStack } from "./layout"
import { useTags } from "@/lib/client/hook/useTags"
import { Badge } from "./badge"
import { XIcon } from "@phosphor-icons/react"

export function SongCardList() {
  const unknownArtist = "Unknown Artist"
  const unknownAlbum = "Unknown Album"
  const { tags: filterTags, pushTag, isIncludesTag } = useTags(2)
  const [searchQuery, setSearchQuery] = useQueryState("q", {
    defaultValue: "",
  })
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useDebounce(
    searchQuery,
    300,
  )
  const [sortDirection, setSortDirection] = useState<"a-z" | "z-a">("a-z")
  const [sortBy, setSortBy] = useState<"title" | "artist" | "album">("title")

  const { songs, isLoading, count } = useSongsContext()
  const [isFirstRender, setIsFirstRender] = useState(true)

  const [songsToShow, setSongsToShow] = useState<SongDTO[]>(
    songs.sort((a, b) => {
      if (sortDirection === "a-z") {
        return a[sortBy]?.localeCompare(b[sortBy] ?? "") ?? 0
      }
      return b[sortBy]?.localeCompare(a[sortBy] ?? "") ?? 0
    }),
  )
  useEffect(() => {
    const updateSongsToShow = () => {
      if (filterTags.length === 0 && searchQuery === "")
        setSongsToShow(
          songs.sort((a, b) => {
            if (sortDirection === "a-z") {
              return a[sortBy]?.localeCompare(b[sortBy] ?? "") ?? 0
            }
            return b[sortBy]?.localeCompare(a[sortBy] ?? "") ?? 0
          }),
        )

      setSongsToShow(
        songs
          .filter((song) => {
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
            if (filterTags.length === 0) {
              return isMatchesQuery
            }
            // * MARK: - Check if tags match song's artist or album
            const tagTypes = filterTags.map((t) => t.type)
            const isArtistAndAlbumTags =
              tagTypes.includes("artist") && tagTypes.includes("album")
            // * MARK: - Check if tags match song's artist and album, if one tag is artist and other is album
            if (isArtistAndAlbumTags) {
              /**
               * Check if artist matches artist tag (unknown artist is considered a match for all unknown artists)
               */
              let isArtistMatches =
                !song.artist &&
                filterTags
                  .find((t) => t.type === "artist")!
                  .value.toLowerCase() === unknownArtist.toLowerCase()
              isArtistMatches ||=
                song.artist
                  ?.toLowerCase()
                  .includes(
                    filterTags
                      .find((t) => t.type === "artist")!
                      .value.toLowerCase(),
                  ) ?? false

              /**
               * Check if album matches album tag (unknown album is considered a match for all unknown albums)
               */
              let isAlbumMatches =
                !song.album &&
                filterTags
                  .find((t) => t.type === "album")!
                  .value.toLowerCase() === unknownAlbum.toLowerCase()
              isAlbumMatches ||=
                song.album
                  ?.toLowerCase()
                  .includes(
                    filterTags
                      .find((t) => t.type === "album")!
                      .value.toLowerCase(),
                  ) ?? false

              // * MARK: - Check if both artist and album match, if search query is present, then narrow down the matches to only those that match search query
              return (
                isArtistMatches &&
                isAlbumMatches &&
                (debouncedSearchQuery === "" || isMatchesQuery)
              )
            }

            // * MARK: - If tags are the same, then check against individual tags
            // for example: if tags are both type "artist", then just match albums no matter the artist
            const isMatchesTags: boolean = filterTags.some((tag) => {
              /**
               * Check if artist matches artist tag (unknown artist is considered a match for all unknown artists)
               */
              let isArtistMatches =
                !song.artist &&
                tag.value.toLowerCase() === unknownArtist.toLowerCase()
              isArtistMatches ||=
                song.artist?.toLowerCase().includes(tag.value.toLowerCase()) ??
                false

              /**
               * Check if album matches album tag (unknown album is considered a match for all unknown albums)
               */
              let isAlbumMatches =
                !song.album &&
                tag.value.toLowerCase() === unknownAlbum.toLowerCase()
              isAlbumMatches ||=
                song.album?.toLowerCase().includes(tag.value.toLowerCase()) ??
                false

              return isArtistMatches || isAlbumMatches
            })
            if (debouncedSearchQuery === "") {
              return isMatchesTags
            }

            return isMatchesQuery && isMatchesTags
          })
          .sort((a, b) => {
            const firstElement = a[sortBy] ?? "Unknown"
            const secondElement = b[sortBy] ?? "Unknown"
            if (sortDirection === "a-z") {
              return firstElement.localeCompare(b[sortBy] ?? "Unknown") ?? 0
            }
            return secondElement.localeCompare(a[sortBy] ?? "Unknown") ?? 0
          }),
      )
    }
    if (isFirstRender) {
      setIsFirstRender(false)
      updateSongsToShow()
    } else {
      startTransition(() => {
        updateSongsToShow()
      })
    }
  }, [songs, filterTags, debouncedSearchQuery, sortDirection, sortBy])
  const countToShow = useMemo(() => {
    if (filterTags.length === 0 && searchQuery === "") return count
    return songsToShow.length
  }, [count, songsToShow])

  function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
    setDebouncedSearchQuery(event.target.value)
    setSearchQuery(event.target.value)
  }

  function resetSearch() {
    setSearchQuery("")
    setDebouncedSearchQuery("")
  }

  function handleSortDirectionChange() {
    startTransition(() => {
      setSortDirection((prev) => {
        if (prev === "a-z") return "z-a"
        return "a-z"
      })
    })
  }

  function handleSortByChange(event: string) {
    const allowedSortBy = ["title", "artist", "album"]
    if (!allowedSortBy.includes(event)) return
    setSortBy(event as "title" | "artist" | "album")
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
      <HStack className="gap-2 mb-2">
        {filterTags.map((tag) => {
          return (
            <Badge
              key={tag.value}
              variant="default"
              className="text-xs flex lg:hidden"
              onClick={(e) => pushTag(tag.type, tag.value)}
            >
              <XIcon
                data-icon="inline-start"
                className="w-5 h-5"
                weight="bold"
              />
              {tag.value}
            </Badge>
          )
        })}
      </HStack>
      <HStack className="gap-2" justifyContent="center">
        <InputGroup className="max-w-lg bg-background">
          <InputGroupInput
            placeholder="Search..."
            onChange={handleSearch}
            value={searchQuery}
          />
          <InputGroupAddon>
            <Search />
            {filterTags.map((tag) => {
              return (
                <Badge
                  key={tag.value}
                  variant="default"
                  className="text-xs hidden lg:flex"
                  onClick={() => pushTag(tag.type, tag.value)}
                >
                  <XIcon
                    data-icon="inline-start"
                    className="w-5 h-5"
                    weight="bold"
                  />
                  {tag.value}
                </Badge>
              )
            })}
          </InputGroupAddon>
          <InputGroupAddon
            align="inline-end"
            className="hidden xs:flex items-center gap-0 pr-1.5"
          >
            {countToShow && `${countToShow} results`}
            <Button
              variant="ghost"
              className="ml-1"
              size="icon"
              onClick={resetSearch}
            >
              <X />
            </Button>
          </InputGroupAddon>
        </InputGroup>
        <ButtonGroup>
          <Button variant="outline" onClick={handleSortDirectionChange}>
            {sortDirection === "a-z" ? <ArrowDownAZ /> : <ArrowDownZA />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="More Options">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  onValueChange={(event) => handleSortByChange(event)}
                  value={sortBy}
                >
                  <DropdownMenuRadioItem value="title">
                    Title
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="artist">
                    Artist
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="album">
                    Album
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      </HStack>

      <div
        className={cn(
          "flex flex-wrap gap-2 place-items-center my-3 mx-auto",
          countToShow === 0 && "justify-center",
        )}
      >
        {!isLoading &&
          songsToShow.length !== 0 &&
          countToShow !== 0 &&
          songsToShow.map((song) => (
            <SongCardResponsiveClient
              isAlbumTagActive={isIncludesTag(song.album ?? "Unknown Album")}
              isArtistTagActive={isIncludesTag(song.artist ?? "Unknown Artist")}
              onTagClick={pushTag}
              key={song.id}
              song={song}
              className="h-full"
            />
          ))}

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
