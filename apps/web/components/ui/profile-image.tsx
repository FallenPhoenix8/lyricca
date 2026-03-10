"use client"
import Image from "next/image"
import { ZStack } from "./layout"
import { PlaceholderImage } from "./svg/PlaceholderImage"

export function ProfileImage({ profileURL }: { profileURL: string | null }) {
  return (
    <ZStack className="w-28 aspect-square">
      {profileURL ? (
        <Image
          src={profileURL}
          alt="Profile Picture"
          width={112}
          height={112}
          className="absolute inset-0 aspect-square bg-accent animate-pulse object-cover"
          style={{
            maskImage: `url("/9-Cookie.svg")`,
            maskSize: "112px 112px",
          }}
          onLoad={(event) => {
            const target = event.target as HTMLImageElement
            target.classList.remove("animate-pulse")
          }}
        />
      ) : (
        <PlaceholderImage className="absolute inset-0" />
      )}
    </ZStack>
  )
}
