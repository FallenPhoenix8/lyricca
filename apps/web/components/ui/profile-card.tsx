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

export async function ProfileCard() {
  const user = await fetchUserProfile()
  const usage = await fetchTranslationUsage()
  return (
    <VStack>
      <HStack
        className="h-20 gap-4 rounded-xl max-w-lg w-full mx-auto shadow-md shadow-card/50 border-2 border-card-foreground/10 bg-card p-1 md:p-4 justify-between md:min-h-32"
        alignItems="center"
      >
        <ProfileImage profileURL={user.profile_url} />
        <VStack className="flex-1 h-full justify-start py-2">
          <h1 className="text-xl md:text-2xl font-bold line-clamp-1">
            {user.username}
          </h1>
        </VStack>
        <TotalUsageChart limitUsage={usage.limit} currentUsage={usage.count} />
      </HStack>
    </VStack>
  )
}
