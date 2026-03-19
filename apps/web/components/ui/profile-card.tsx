"use server"

import { HStack, VStack, ZStack } from "./layout"
import Image from "next/image"
import { pathData } from "./svg/shapes/Cookie9"
import { Suspense } from "react"
import { ProfileImage } from "./profile-image"
import { TranslationUsageDTO, UserDTO } from "@shared/ts-types"
import { cookies } from "next/headers"
import { TotalUsageChart } from "./total-usage-chart"
import { cn } from "@/lib/utils"

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

export async function ProfileCard() {
  const user = await fetchUserProfile()
  const usage = await fetchTranslationUsage()
  return (
    <VStack>
      <HStack
        className="h-16 md:h-20 gap-1 md:gap-4 w-full justify-between"
        alignItems="center"
      >
        <ProfileImage profileURL={user.profile_url} />
        <VStack className="flex-1 h-full justify-start py-2">
          <p
            className={cn(
              "font-bold line-clamp-1 overflow-elipsis max-w-[14ch]",
              user.username.length > 10
                ? "text-xs md:text-xl"
                : "text-sm md:text-2xl",
            )}
          >
            {user.username}
          </p>
          <p className="text-xs text-muted-foreground font-bold line-clamp-1 overflow-elipsis">
            {user.email}
          </p>
        </VStack>
        <TotalUsageChart limitUsage={usage.limit} currentUsage={usage.count} />
      </HStack>
    </VStack>
  )
}
