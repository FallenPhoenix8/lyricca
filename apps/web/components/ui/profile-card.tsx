"use server"

import { HStack, VStack, ZStack } from "./layout"
import Image from "next/image"
import { pathData } from "./svg/shapes/Cookie9"
import { Suspense } from "react"
import { ProfileImage } from "./profile-image"
import { TranslationUsageDTO, UserDTO } from "@shared/ts-types"
import { cookies } from "next/headers"
import { TotalUsageChart } from "./total-usage-chart"

const apiURL = process.env.NEXT_PUBLIC_API_URL
if (!apiURL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set")
}

async function fetchUserProfile() {
  const token = (await cookies()).get("token")?.value ?? ""
  const endpoint = "users/me"
  const url = new URL(endpoint, apiURL)
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
  const data = (await response.json()) as UserDTO
  return data
}

async function fetchTranslationUsage() {
  const token = (await cookies()).get("token")?.value ?? ""
  const endpoint = "translate/usage"
  const url = new URL(endpoint, apiURL)
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
  const data = (await response.json()) as TranslationUsageDTO
  return data
}

function ImageSkeleton() {
  return (
    <Image
      src="/empty.png"
      alt="Profile Picture"
      width={112}
      height={112}
      className="w-28 aspect-square bg-accent animate-pulse object-cover"
      style={{
        maskImage: `url("/9-Cookie.svg")`,
        maskSize: "112px 112px",
      }}
    />
  )
}

export async function ProfileCard() {
  const user = await fetchUserProfile()
  const usage = await fetchTranslationUsage()
  const usagePercentage = ((usage.count / usage.limit) * 100).toFixed(1)
  return (
    <HStack
      className="h-full gap-4 rounded-xl shadow-md shadow-card/50 border-2 border-card-foreground/10 bg-card p-4"
      alignItems="center"
      justifyContent="between"
    >
      <Suspense fallback={<ImageSkeleton />}>
        <ProfileImage profileURL={user.profile_url} />
      </Suspense>
      <VStack className="h-full justify-start py-2">
        <h1 className="text-2xl font-bold line-clamp-1">{user.username}</h1>
      </VStack>
      <TotalUsageChart limitUsage={usage.limit} currentUsage={usage.count} />
    </HStack>
  )
}
