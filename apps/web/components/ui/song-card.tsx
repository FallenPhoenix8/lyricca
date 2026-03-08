"use client"

import { Badge } from "./badge"
import { Card, CardTitle, CardHeader, CardDescription } from "./card"
import { ImageRosetta } from "./svg/ImageRosetta"
import { SongDTO } from "@shared/ts-types"
import Image from "next/image"
import { DotIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { easeOvershootClassName, easeBezierClassName } from "./constants"
import { HStack, VStack } from "./layout"
import { useEffect, useState } from "react"
import { Skeleton } from "./skeleton"
import { ViewTransition } from "react"

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
function SongCardRegular(props: { song: SongDTO; className?: string }) {
  return (
    <Card
      className={cn(
        "relative w-52 min-h-96 pt-0 shadow-sm dark:shadow-muted/50 shadow-foreground/10 hover:shadow-lg hover:-translate-y-1 transition-[shadow,transition,border-radius] duration-300 group hover:rounded-2xl",
        easeOvershootClassName,
        props.className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 z-10 aspect-square bg-foreground/10 dark:bg-background/50 rounded-t-xl shadow-muted/50 shadow-none group-hover:shadow-sm transition-[border-radius,shadow] duration-300 group-hover:rounded-b-xl group-hover:rounded-t-2xl",
          easeOvershootClassName,
        )}
      />

      <Link href={`/app/library/${props.song.id}`} className="w-full">
        <ViewTransition name={`${props.song.id}-cover`}>
          <Image
            src={props.song.cover?.url ?? "/default-cover.png"}
            alt={props.song.title}
            className={cn(
              "relative z-20 aspect-square object-cover rounded-t-xl group-hover:rounded-b-xl w-full transition-[border-radius,scale] duration-300 group-hover:scale-95 group-hover:rounded-t-2xl bg-accent animate-pulse",
              easeOvershootClassName,
            )}
            onLoad={(event) => {
              const target = event.target as HTMLImageElement
              target.classList.remove("animate-pulse")
            }}
            width={224}
            height={224}
          />
        </ViewTransition>
      </Link>

      <CardHeader>
        <ViewTransition name={`${props.song.id}-title`}>
          <CardTitle className="leading-normal">
            <Link
              href={`/app/library/${props.song.id}`}
              className="w-full font-semibold line-clamp-2 underline-offset-4 hover:underline"
            >
              {props.song.title}
            </Link>
          </CardTitle>
        </ViewTransition>

        <CardDescription className="flex flex-wrap gap-2">
          {props.song.artist ? (
            <Badge variant="secondary">{props.song.artist}</Badge>
          ) : (
            <Badge variant="outline">Unknown Artist</Badge>
          )}
          {props.song.album ? (
            <Badge variant="secondary">{props.song.album}</Badge>
          ) : (
            <Badge variant="outline">Unknown Album</Badge>
          )}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

/**
 * A song card with a cover image, title, artist, and album to be displayed in a card layout on compact screens.
 */
function SongCardCompact(props: { song: SongDTO; className?: string }) {
  const [isActive, setIsActive] = useState(false)

  return (
    <Link
      href={`/app/library/${props.song.id}`}
      className={cn("flex relative w-full p-1 rounded-md", props.className)}
      onTouchStart={() => setIsActive(true)}
      onTouchEnd={() => setIsActive(false)}
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
            src={props.song.cover?.url ?? "/default-cover.png"}
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
          <span>{props.song.artist ?? "Unknown Artist"}</span>
          <DotIcon className="inline" size={16} />
          <span>{props.song.album ?? "Unknown Album"}</span>
        </div>
      </VStack>
    </Link>
  )
}

/**
 * A song card with a cover image, title, artist, and album to be displayed in a card layout. The card layout can be compact or regular depending on the screen size.
 * DO NOT USE THIS COMPONENT DIRECTLY. Use the `SongCardResponsive` component exported by `./song-card-responsive-client.tsx` instead. Otherwise, the view transitions will break.
 */
export function SongCard(props: {
  song: SongDTO
  className?: string
  isCompact?: boolean
}) {
  return props.isCompact ? (
    <SongCardCompact song={props.song} className={props.className} />
  ) : (
    <SongCardRegular song={props.song} className={props.className} />
  )
}
/**
 * A responsive song card with a cover image, title, artist, and album to be displayed in a card layout. The card layout can be compact or regular depending on the screen size.
 * DO NOT USE THIS COMPONENT DIRECTLY. Use the `SongCardResponsive` component exported by `./song-card-responsive.tsx` instead. Otherwise, the view transitions will break.
 */
export default function ResponsiveSongCard(props: {
  song: SongDTO
  className?: string
}) {
  const isCompact = useMediaQuery("(max-width: 460px)")

  return (
    <SongCard
      song={props.song}
      className={props.className}
      isCompact={isCompact}
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
