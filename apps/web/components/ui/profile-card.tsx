"use server"

import { HStack, VStack, ZStack } from "./layout"
import { ProfileImage } from "./profile-image"
import { TranslationUsageDTO, UserDTO } from "@shared/ts-types"
import { cookies } from "next/headers"
import { TotalUsageChart } from "./total-usage-chart"
import { cn } from "@/lib/utils"

import {
  fetchUserProfile,
  fetchTranslationUsage,
} from "@/lib/data/server-fetch"

export async function ProfileCard() {
  const user = await fetchUserProfile()
  const usage = await fetchTranslationUsage()
  return (
    <VStack className="drop-shadow-xs drop-shadow-black/20 bg-secondary text-secondary-foreground rounded-full">
      <HStack
        className="h-16 md:h-20 gap-1 md:gap-4 w-full justify-between"
        alignItems="center"
      >
        <ProfileImage profileURL={user.profile_url} userId={user.id} />
        <VStack className="flex-1 h-full justify-start py-2">
          <p
            className={cn(
              "font-bold line-clamp-1 overflow-elipsis max-w-[14ch] font-heading",
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
