import {
  startTransition,
  use,
  useEffect,
  useRef,
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
import db from "@/lib/client/db"
import { useLiveQuery } from "dexie-react-hooks"
import { useReferralSongContext } from "./ReferralSongContext"

type TSortBy = "title" | "artist" | "album"

export function SongCardList() {
  const unknownArtist = "Unknown Artist"
  const unknownAlbum = "Unknown Album"
  const {
    tags: filterTags,
    pushTag,
    isIncludesTag,
    clear: clearTags,
  } = useTags(2)
  const [searchQuery, setSearchQuery] = useQueryState("q", {
    defaultValue: "",
  })
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useDebounce(
    searchQuery,
    300,
  )
  const [sortDirection, setSortDirection] = useQueryState("dir", {
    defaultValue: "a-z",
  })
  const [sortBy, setSortBy] = useQueryState("by", { defaultValue: "title" })

  const { isLoading, count, syncNow, findOneLocally } = useSongsContext()
  const { referralSong, referralSongListIndex } = useReferralSongContext()
  /**
   * Actual songs to be displayed in the list. This is a state that is updated whenever the songsCollection hook changes. It is used to trigger ViewTransition.
   */
  const [songsToShow, setSongsToShow] = useState<SongDTO[]>([])
  /**
   * This hook is used to fetch songs from the database. It leverages the use of Indexes to speed up the search process.
   */
  const songsCollection = useLiveQuery(
    async () => {
      const q = debouncedSearchQuery.toLowerCase()
      let collection

      // 1. DATA ACCESS (Using Indexes)
      const artistTag = filterTags
        .find((t) => t.type === "artist")
        ?.value.toLowerCase()
      const albumTag = filterTags
        .find((t) => t.type === "album")
        ?.value.toLowerCase()

      if (artistTag && albumTag) {
        collection = db.songs
          .where("[search_artist+search_album]")
          .equals([artistTag, albumTag])
      } else if (artistTag) {
        collection = db.songs.where("search_artist").equals(artistTag)
      } else if (albumTag) {
        collection = db.songs.where("search_album").equals(albumTag)
      } else {
        collection = db.songs.toCollection()
      }

      // 2. FILTERING
      if (q !== "") {
        collection = collection.filter(
          (song) =>
            song.title.toLowerCase().includes(q) ||
            song.search_artist!.includes(q) ||
            song.search_album!.includes(q),
        )
      }

      // 3. RELIABLE SORTING
      // Extract the array first
      return await collection.toArray()
    },
    [debouncedSearchQuery, filterTags],
    referralSong ? [referralSong] : [],
  )

  // Trigger ViewTransition when songsToShow actually changes
  useEffect(() => {
    if (!songsCollection) return

    const updateUI = () => {
      // 1. Create a NEW array reference (Crucial for React to see the change)
      const baseArray = [...songsCollection]

      // 2. Sort using a predictable comparator
      baseArray.sort((a, b) => {
        // Use the 'sortBy' state dynamically
        const valA = String(a[sortBy as TSortBy] || "unknown").toLowerCase()
        const valB = String(b[sortBy as TSortBy] || "unknown").toLowerCase()

        const comparison = valA.localeCompare(valB, undefined, {
          numeric: true,
        })
        return sortDirection === "a-z" ? comparison : -comparison
      })

      setSongsToShow(baseArray)
    }

    // 3. Trigger View Transition if supported
    if (document.startViewTransition !== undefined) {
      startTransition(() => {
        updateUI()
      })
    } else {
      updateUI()
    }
  }, [songsCollection, sortBy, sortDirection])

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
    clearTags()
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
    setSortBy(event as TSortBy)
  }

  const skeletonCards: null[] = new Array(20).fill(null)
  const skeletonCardsWithReferralSong: (SongDTO | null)[] = new Array(
    referralSongListIndex + 10,
  ).fill(null)
  skeletonCardsWithReferralSong[referralSongListIndex] = referralSong

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

  useEffect(() => {
    syncNow()
  }, [])

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
        {songsToShow.length === 0 &&
          referralSong &&
          skeletonCardsWithReferralSong.map((song, index) =>
            song ? (
              <SongCardResponsiveClient
                isAlbumTagActive={isIncludesTag(song?.album ?? "Unknown Album")}
                isArtistTagActive={isIncludesTag(
                  song?.artist ?? "Unknown Artist",
                )}
                onTagClick={pushTag}
                key={song?.id}
                song={song ?? null}
                className="h-full"
                index={index}
              />
            ) : (
              <SkeletonSongCard key={`skeleton-card-${index}`} />
            ),
          )}
        {!isLoading &&
          songsCollection.length !== 0 &&
          songsToShow.length !== 0 &&
          countToShow !== 0 &&
          songsToShow.map((song, index) => (
            <SongCardResponsiveClient
              isAlbumTagActive={isIncludesTag(song.album ?? "Unknown Album")}
              isArtistTagActive={isIncludesTag(song.artist ?? "Unknown Artist")}
              onTagClick={pushTag}
              key={song.id}
              song={song}
              className="h-full"
              index={index}
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
