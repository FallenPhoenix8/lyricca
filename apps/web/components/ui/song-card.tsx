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

export function SongCard(props: { song: SongDTO; className?: string }) {
  return (
    <Card
      className={cn(
        "relative max-w-sm pt-0 shadow-sm shadow-muted/50 hover:shadow-lg hover:-translate-1 transition duration-300",
        props.className,
      )}
    >
      <div className="absolute inset-0 z-10 aspect-video bg-background/50 rounded-xl" />
      {props.song.cover ? (
        <Image
          src={props.song.cover.url}
          alt={props.song.title}
          className="relative z-20 aspect-video object-cover rounded-t-xl w-full"
          width={206}
          height={115}
        />
      ) : (
        <ImageRosetta className="relative z-20 aspect-video -mt-6 rounded-xl" />
      )}

      <CardHeader>
        <CardTitle className="line-clamp-1 leading-normal">
          {props.song.title}
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
      <Spacer />
      <hr />
      <CardFooter>
        <Button variant="default" className="w-full">
          View Lyrics
        </Button>
      </CardFooter>
    </Card>
  )
}
