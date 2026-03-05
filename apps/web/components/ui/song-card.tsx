import { Badge } from "./badge"
import { Button } from "./button"
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
  CardFooter,
  CardAction,
} from "./card"
import { ImageRosetta } from "./svg/ImageRosetta"
import { SongDTO } from "@shared/ts-types"
import Image from "next/image"
import { Spacer } from "./layout"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { easeOvershootClassName } from "./constants"

export function SongCard(props: { song: SongDTO; className?: string }) {
  return (
    <Card
      className={cn(
        "relative max-w-52 min-h-96 pt-0 shadow-sm shadow-muted/50 hover:shadow-lg hover:-translate-y-1 transition-[shadow, transition, border-radius] duration-300 group hover:rounded-2xl ",
        easeOvershootClassName,
        props.className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 z-10 aspect-square bg-background/50 rounded-t-xl shadow-muted/50 shadow-none group-hover:shadow-sm transition-[border-radius, shadow] duration-300 group-hover:rounded-b-xl group-hover:rounded-t-2xl",
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
      {/* <Spacer />
      <hr />
      <CardFooter>
        <Link href={`/app/library/${props.song.id}`} className="w-full">
          <Button
            variant="default"
            tabIndex={-1}
            className="w-full"
            onClick={() => console.log("test")}
          >
            View Lyrics
          </Button>
        </Link>
      </CardFooter> */}
    </Card>
  )
}
