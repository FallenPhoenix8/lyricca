"use client"
import Image from "next/image"
import { ZStack, ZStackGrid } from "./layout"
import { PlaceholderImage } from "./svg/PlaceholderImage"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useWindowDimensions } from "@/lib/client/hook/useWindowDimensions"
import { Cookie9 } from "./svg/shapes/Cookie9"

export function ProfileImage({ profileURL }: { profileURL: string | null }) {
  const imageRef = useRef<HTMLImageElement>(null)
  const [dims, setDims] = useState({ width: 68, height: 68 })

  const { width } = useWindowDimensions() ?? { width: 0 }
  useLayoutEffect(() => {
    if (imageRef.current) {
      const { width, height } = imageRef.current?.getBoundingClientRect()
      setDims({ width, height })
    }
  }, [imageRef, width])
  return (
    <ZStackGrid className="h-full aspect-square place-items-center">
      {!profileURL ? (
        <Image
          src={profileURL ?? ""}
          alt="Profile Picture"
          width={68}
          height={68}
          className="h-full w-full aspect-square bg-accent animate-pulse object-cover"
          style={{
            maskImage: `url("/9-Cookie.svg")`,
            maskSize: `${dims.width}px ${dims.height}px`,
          }}
          onLoad={(event) => {
            const target = event.target as HTMLImageElement
            target.classList.remove("animate-pulse")
          }}
          ref={imageRef}
        />
      ) : (
        <PlaceholderImage className="bg-none" />
      )}
    </ZStackGrid>
  )
}
