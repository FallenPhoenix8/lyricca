"use client"

import { Badge } from "./badge"
import { Card, CardTitle, CardHeader, CardDescription } from "./card"
import { ImageRosetta } from "./svg/ImageRosetta"
import { SongDTO } from "@shared/ts-types"
import Image from "next/image"
import { DotIcon } from "lucide-react"
import { XIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { easeOvershootClassName, easeBezierClassName } from "./constants"
import { HStack, VStack } from "./layout"
import { Ref, useEffect, useLayoutEffect, useRef, useState } from "react"
import { Skeleton } from "./skeleton"
import { ViewTransition } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useRouter, useSearchParams } from "next/navigation"
import { useQueryState } from "nuqs"
import { useReferralSongContext } from "./ReferralSongContext"
import { useWindowDimensions } from "@/lib/client/hook/useWindowDimensions"

gsap.registerPlugin(useGSAP)
/**
 * This hook uses the `matchMedia` API to check if the current window size matches the given query.
 * @param query The media query to check.
 * @returns Whether the current window size matches the given query.
 */
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setMatches(media.matches)

    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [query])

  return matches
}

/**
 * A song card with a cover image, title, artist, and album to be displayed in a card layout on regular screens.
 */
function SongCardRegular(props: {
  song: SongDTO
  className?: string
  style?: React.CSSProperties
  ref?: Ref<HTMLDivElement>
  isArtistTagActive: boolean
  isAlbumTagActive: boolean
  index?: number
  onTagClick: (type: "artist" | "album", tag: string) => void
}) {
  const [searchParams] = useQueryState("q", { defaultValue: "" })
  const encodedSearchParams = encodeURIComponent(searchParams)

  const unknownArtist = "Unknown Artist"
  const unknownAlbum = "Unknown Album"

  function handleTagClick(
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    type: "artist" | "album",
  ) {
    const target = event.target as HTMLSpanElement
    const tag = target.textContent
    if (tag) {
      props.onTagClick(type, tag)
    }
  }

  const closeButtonArtistTag = props.isArtistTagActive ? (
    <XIcon data-icon="inline-start" className="w-5 h-5" weight="bold" />
  ) : (
    <></>
  )
  const closeButtonAlbumTag = props.isAlbumTagActive ? (
    <XIcon data-icon="inline-start" className="w-5 h-5" weight="bold" />
  ) : (
    <></>
  )

  const { setReferralSongId, setReferralSongListIndex } =
    useReferralSongContext()
  const router = useRouter()
  const href = `/app/library/${props.song.id}?q=${encodedSearchParams}`
  return (
    <Card
      className={cn(
        "relative w-52 min-h-96 pt-0 shadow-sm dark:shadow-muted/50 shadow-foreground/10 hover:shadow-lg hover:-translate-y-1 transition-[shadow,transition,border-radius] duration-300 group hover:rounded-2xl",
        easeOvershootClassName,
        props.className,
      )}
      style={props.style}
      ref={props.ref}
    >
      <div
        className={cn(
          "absolute inset-0 z-10 aspect-square bg-foreground/10 dark:bg-background/50 rounded-t-xl shadow-muted/50 shadow-none group-hover:shadow-sm transition-[border-radius,shadow] duration-300 group-hover:rounded-b-xl group-hover:rounded-t-2xl",
          easeOvershootClassName,
        )}
      />

      <Link
        href={`/app/library/${props.song.id}?q=${encodedSearchParams}`}
        className="w-full"
        onClick={(event) => {
          event.preventDefault()
          setReferralSongId(props.song.id)
          router.push(href)
        }}
      >
        <ViewTransition name={`${props.song.id}-cover`}>
          <Image
            src={props.song.cover?.url ?? "/empty.png"}
            alt={props.song.title}
            className={cn(
              "relative z-20 aspect-square object-cover rounded-t-xl group-hover:rounded-b-xl w-full transition-[border-radius,scale] duration-300 group-hover:scale-95 group-hover:rounded-t-2xl bg-accent animate-pulse",
              easeOvershootClassName,
            )}
            onLoad={(event) => {
              const target = event.target as HTMLImageElement
              target.classList.remove("animate-pulse")
            }}
            loading="eager"
            width={224}
            height={224}
          />
        </ViewTransition>
      </Link>

      <CardHeader>
        <ViewTransition name={`${props.song.id}-title`}>
          <CardTitle className="leading-normal">
            <Link
              href={href}
              className="w-full font-semibold line-clamp-2 underline-offset-4 hover:underline"
              onNavigate={(event) => {
                event.preventDefault()
                setReferralSongId(props.song.id)
                setReferralSongListIndex(props.index ?? 0)
                router.push(href)
              }}
            >
              {props.song.title}
            </Link>
          </CardTitle>
        </ViewTransition>

        <CardDescription className="flex flex-wrap gap-2">
          {props.song.artist ? (
            <Badge
              variant={props.isArtistTagActive ? "default" : "secondary"}
              onClick={(e) => handleTagClick(e, "artist")}
            >
              {closeButtonArtistTag}
              {props.song.artist}
            </Badge>
          ) : (
            <Badge
              variant={props.isArtistTagActive ? "default" : "outline"}
              onClick={(e) => handleTagClick(e, "artist")}
            >
              {closeButtonArtistTag}
              {unknownArtist}
            </Badge>
          )}
          {props.song.album ? (
            <Badge
              variant={props.isAlbumTagActive ? "default" : "secondary"}
              onClick={(e) => handleTagClick(e, "album")}
            >
              {closeButtonAlbumTag}
              {props.song.album}
            </Badge>
          ) : (
            <Badge
              variant={props.isAlbumTagActive ? "default" : "outline"}
              onClick={(e) => handleTagClick(e, "album")}
            >
              {closeButtonAlbumTag}
              {unknownAlbum}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

/**
 * A song card with a cover image, title, artist, and album to be displayed in a card layout on compact screens.
 */
function SongCardCompact(props: {
  song: SongDTO
  className?: string
  ref?: Ref<HTMLDivElement>
  style?: React.CSSProperties
  index?: number
}) {
  const [isActive, setIsActive] = useState(false)
  const [searchParams] = useQueryState("q", { defaultValue: "" })
  const { setReferralSongId, setReferralSongListIndex } =
    useReferralSongContext()
  const router = useRouter()
  const href = `/app/library/${props.song.id}?q=${encodeURIComponent(
    searchParams,
  )}`
  return (
    <div
      ref={props.ref}
      className={cn("relative w-full p-1 rounded-md", props.className)}
      style={props.style}
    >
      <Link
        href={href}
        className="flex w-full"
        onTouchStart={() => setIsActive(true)}
        onTouchEnd={() => setIsActive(false)}
        onNavigate={(event) => {
          event.preventDefault()
          setReferralSongId(props.song.id)
          setReferralSongListIndex(props.index ?? 0)
          router.push(href)
        }}
      >
        <div
          className={cn(
            "absolute inset-0 duration-300 transition-[background-color,border-radius,scale,shadow] -z-10 rounded-sm shadow-none drop-shadow-card",
            easeBezierClassName,
            isActive && "bg-card rounded-md scale-105 shadow-sm",
          )}
        />

        <div className="grid place-items-center h-10 aspect-square bg-secondary rounded-xs squircle shadow-sm dark:shadow-background/50 shadow-foreground/50">
          <ViewTransition name={`${props.song.id}-cover`}>
            <Image
              src={props.song.cover?.url ?? "/empty.png"}
              alt={props.song.title}
              className="h-full aspect-square object-cover rounded-xs squircle bg-accent animate-pulse"
              onLoad={(event) => {
                const target = event.target as HTMLImageElement
                target.classList.remove("animate-pulse")
              }}
              width={40}
              height={40}
            />
          </ViewTransition>
        </div>

        <VStack className="px-2 justify-around">
          <ViewTransition name={`${props.song.id}-title`}>
            <div className="text-sm font-semibold line-clamp-1">
              {props.song.title}
            </div>
          </ViewTransition>

          <div className="text-xs text-muted-foreground line-clamp-1">
            <span>{props.song.artist || "Unknown Artist"}</span>
            <DotIcon className="inline" size={16} />
            <span>{props.song.album || "Unknown Album"}</span>
          </div>
        </VStack>
      </Link>
    </div>
  )
}

/**
 * A song card with a cover image, title, artist, and album to be displayed in a card layout. The card layout can be compact or regular depending on the screen size.
 * DO NOT USE THIS COMPONENT DIRECTLY. Use the `SongCardResponsive` component exported by `./song-card-responsive-client.tsx` instead. Otherwise, the view transitions will break.
 */
export function SongCard(props: {
  song: SongDTO
  isArtistTagActive: boolean
  isAlbumTagActive: boolean
  onTagClick(type: "artist" | "album", tag: string): void
  className?: string
  isCompact?: boolean
  ref?: Ref<HTMLDivElement>
  style?: React.CSSProperties
  index?: number
}) {
  return (
    <div className={cn(props.isCompact && "w-full")}>
      {props.isCompact ? (
        <SongCardCompact
          song={props.song}
          className={props.className}
          ref={props.ref}
          style={props.style}
          index={props.index}
        />
      ) : (
        <SongCardRegular
          song={props.song}
          className={props.className}
          onTagClick={props.onTagClick}
          isAlbumTagActive={props.isAlbumTagActive}
          isArtistTagActive={props.isArtistTagActive}
          ref={props.ref}
          style={props.style}
          index={props.index}
        />
      )}
    </div>
  )
}
/**
 * A responsive song card with a cover image, title, artist, and album to be displayed in a card layout. The card layout can be compact or regular depending on the screen size.
 * DO NOT USE THIS COMPONENT DIRECTLY. Use the `SongCardResponsive` component exported by `./song-card-responsive.tsx` instead. Otherwise, the view transitions will break.
 */
export default function ResponsiveSongCard(props: {
  song: SongDTO
  isArtistTagActive: boolean
  isAlbumTagActive: boolean
  onTagClick(type: "artist" | "album", tag: string): void
  className?: string
  style?: React.CSSProperties
  index?: number
}) {
  const isCompact = useMediaQuery("(max-width: 460px)")

  return (
    <SongCard
      isAlbumTagActive={props.isAlbumTagActive}
      isArtistTagActive={props.isArtistTagActive}
      onTagClick={props.onTagClick}
      song={props.song}
      className={props.className}
      isCompact={isCompact}
      style={props.style}
      index={props.index}
    />
  )
}

/**
 * A skeleton song card to be displayed in a card layout.
 */
export function SkeletonSongCard() {
  return (
    <>
      <Card className="hidden xs:flex relative w-52 min-h-96 pt-0 shadow-sm dark:shadow-muted/50 shadow-foreground/10">
        <Skeleton className="aspect-square bg-foreground/10 dark:bg-background/50 rounded-t-xl" />
        <CardTitle className="leading-normal">
          <Skeleton className="max-w-full h-6 rounded-sm mx-2" />
        </CardTitle>
        <CardDescription className="flex flex-wrap gap-2 px-2">
          <Badge variant="secondary">
            <Skeleton className="h-4 w-20 rounded-full" />
          </Badge>
          <Badge variant="secondary">
            <Skeleton className="h-4 w-24 rounded-full" />
          </Badge>
        </CardDescription>
      </Card>

      <HStack className="flex xs:hidden w-full p-1">
        <Skeleton className="h-10 aspect-square bg-secondary rounded-xs squircle shadow-sm" />
        <VStack className="px-2 justify-around w-full h-10">
          <Skeleton className="h-4 w-full rounded-xs" />
          <Skeleton className="h-4 w-3/4 rounded-xs" />
        </VStack>
      </HStack>
    </>
  )
}
