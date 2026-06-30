"use client"
import { ReactNode, useLayoutEffect, useMemo, useRef } from "react"
import { BlurOverlay, overlayBlurClassName } from "../blur-overlay"
import { Card, CardContent } from "../card"
import { ZStackGrid } from "../layout"
import Image from "next/image"
import { useWindowDimensions } from "@/lib/client/hook/useWindowDimensions"

export function CarouselImageCard(props: {
  image: {
    url: string
    alt: string
  }
  title: ReactNode
  description: ReactNode
}) {
  const imageRef = useRef<HTMLImageElement>(null)
  const textOverlayRef = useRef<HTMLDivElement>(null)
  const dims = useWindowDimensions()
  const marginBottom = useMemo(
    () => textOverlayRef.current?.getBoundingClientRect().height ?? 0,
    [textOverlayRef.current, dims],
  )
  // useLayoutEffect(() => {
  //   function handleResize() {
  //     if (!imageRef.current) return
  //     props.setMaxControlsHeight(
  //       imageRef.current.getBoundingClientRect().height,
  //     )
  //   }
  //   handleResize()
  //   window.addEventListener("resize", handleResize)
  //   return () => {
  //     window.removeEventListener("resize", handleResize)
  //   }
  // }, [props.setMaxControlsHeight])
  return (
    <div
      style={{
        marginBottom: dims && dims.width < 768 ? marginBottom : 0,
      }}
    >
      <ZStackGrid className="aspect-5/3 max-w-full">
        <Image
          src={props.image.url}
          alt={props.image.alt}
          width={5 * 100 * 5}
          height={3 * 100 * 5}
          className="object-contain aspect-5/3 bg-secondary"
          ref={imageRef}
        />
        <div className="bg-background/50 h-full flex flex-col justify-end">
          <ZStackGrid>
            <div className="px-6 py-4 space-y-2 md:block hidden">
              <h3 className="text-4xl font-extrabold font-heading">
                {props.title}
              </h3>
              <p className="text-lg font-semibold">{props.description}</p>
            </div>
          </ZStackGrid>
        </div>
      </ZStackGrid>
      <div className="px-6 py-4 space-y-2 md:hidden" ref={textOverlayRef}>
        <h3 className="text-4xl font-extrabold font-heading">{props.title}</h3>
        <p className="text-lg font-semibold">{props.description}</p>
      </div>
    </div>
  )
}
