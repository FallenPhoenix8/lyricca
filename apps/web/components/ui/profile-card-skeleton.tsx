"use client"

import { HStack, VStack } from "./layout"
import { Skeleton } from "./skeleton"
import { TotalUsageChartSkeleton } from "./total-usage-chart"
import { Cookie9 } from "./svg/shapes/Cookie9"

export function ProfileCardSkeleton() {
  return (
    <VStack>
      <HStack
        className="h-20 gap-4 rounded-xl w-full justify-between"
        alignItems="center"
      >
        <Cookie9 className="h-20 w-20 animate-pulse fill-accent" />
        <VStack className="flex-1 h-full justify-start py-2">
          <Skeleton className="h-5 md:h-6 w-3/4 rounded-sm" />
        </VStack>
        <TotalUsageChartSkeleton className="mr-1" />
      </HStack>
    </VStack>
  )
}
