"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"

import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { CarouselImageCard } from "./carousel-image-card"
import { ZStackGrid } from "../layout"

export function Demo() {
  const autoplay = React.useRef(
    Autoplay({
      delay: 4000,
      stopOnInteraction: true,
      stopOnFocusIn: true,
    }),
  )
  const items: Parameters<typeof CarouselImageCard>[0][] = [
    {
      image: {
        url: "/demo/library.png",
        alt: "library screenshot",
      },
      title: <>Universal.</>,
      description: (
        <>
          You can store lyrics of all your favorite songs together with their
          translations in one place. Be it Pop, K-Pop, J-Pop or any other genre.
          <br />
          You can also filter them by artist, album or title and easily find
          them in the library - even if you have a lot saved.
        </>
      ),
    },
    {
      image: {
        url: "/demo/details.png",
        alt: "song details screenshots",
      },
      title: <>Personal.</>,
      description: (
        <>
          You can access any song whenever you want and edit it if you need to.
          Every song page will have its own color pallette generated
          automatically from the song's cover art.
          <br />
          The cover can be uploaded manually or you can get a suggestion from
          the internet when adding a new song.
        </>
      ),
    },
    {
      image: {
        url: "/demo/sync-showcase.png",
        alt: "phone and laptops photo with library screenshot",
      },
      title: <>Convenient.</>,
      description: (
        <>
          Your library is stored locally on your device. It's automatically
          synchronized with your Lyricca account between all your devices.
          <br />
          The app will automatically detect changes in your library and update
          your local songs accordingly. It syncs whenever you open the app or
          make a change
        </>
      ),
    },
  ]
  return (
    <section id="demo" className="bg-secondary py-10 flex">
      <Carousel
        className="aspect-5/3 w-screen"
        opts={{ loop: true }}
        plugins={[autoplay.current]}
      >
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={index} className="w-screen">
              <CarouselImageCard {...item} />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="top-[25vw]" />
        <CarouselNext className="top-[25vw]" />
      </Carousel>
    </section>
  )
}
