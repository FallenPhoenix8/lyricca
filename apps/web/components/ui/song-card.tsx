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
import { useState } from "react"

function SongCardRegular(props: { song: SongDTO; className?: string }) {
  return (
    <Card
      className={cn(
        "relative max-w-52 min-h-96 pt-0 shadow-sm dark:shadow-muted/50 shadow-foreground/10 hover:shadow-lg hover:-translate-y-1 transition-[shadow, transition, border-radius] duration-300 group hover:rounded-2xl ",
        easeOvershootClassName,
        props.className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 z-10 aspect-square bg-foreground/10 dark:bg-background/50 rounded-t-xl shadow-muted/50 shadow-none group-hover:shadow-sm transition-[border-radius, shadow] duration-300 group-hover:rounded-b-xl group-hover:rounded-t-2xl",
          easeOvershootClassName,
        )}
      />
      <Link href={`/app/library/${props.song.id}`} className="w-full">
        {props.song.cover ? (
          <Image
            src={props.song.cover.url}
            alt={props.song.title}
            className={cn(
              "relative z-20 aspect-square object-cover rounded-t-xl group-hover:rounded-b-xl w-full transition-[border-radius, scale] duration-300 group-hover:scale-95 group-hover:rounded-t-2xl",
              easeOvershootClassName,
            )}
            width={224}
            height={224}
          />
        ) : (
          <ImageRosetta
            className={cn(
              "relative z-20 aspect-square -mt-6 rounded-xl transition-[border-radius, scale] duration-300 group-hover:scale-95 group-hover:rounded-t-2xl",
              easeOvershootClassName,
            )}
          />
        )}
      </Link>

      <CardHeader>
        <CardTitle className="leading-normal">
          <Link
            href={`/app/library/${props.song.id}`}
            className="w-full font-semibold line-clamp-2 underline-offset-4 hover:underline"
          >
            {props.song.title}
          </Link>
        </CardTitle>
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
          "absolute inset-0 duration-300 transition-[background-color, border-radius, scale, shadow] -z-10 rounded-sm shadow-none drop-shadow-card",
          easeBezierClassName,
          isActive && "bg-card rounded-md scale-105 shadow-sm",
        )}
      ></div>
      <div className="grid place-items-center h-10 aspect-square bg-secondary rounded-xs squircle shadow-sm dark:shadow-background/50 shadow-foreground/50">
        {props.song.cover ? (
          <Image
            src={props.song.cover.url}
            alt={props.song.title}
            className="h-full aspect-square object-cover rounded-xs squircle"
            width={40}
            height={40}
          />
        ) : (
          <ImageRosetta className="h-8 rounded-xs squircle" />
        )}
      </div>
      <VStack className="px-2 justify-around">
        <div className="text-sm font-semibold line-clamp-1">
          {props.song.title}
        </div>
        <div className="text-xs text-muted-foreground line-clamp-1">
          <span>
            {props.song.artist ? props.song.artist : "Unknown Artist"}
          </span>
          <DotIcon className="inline" size={16} />
          <span>{props.song.album ? props.song.album : "Unknown Album"}</span>
        </div>
      </VStack>
    </Link>
  )
}

export function SongCard({
  song,
  className,
  isCompact = false,
}: {
  song: SongDTO
  className?: string
  isCompact?: boolean
}) {
  return isCompact
    ? SongCardCompact({ song, className })
    : SongCardRegular({ song, className })
}
