"use client"

import { HStack, VStack } from "./layout"
import { Skeleton } from "./skeleton"
import { TotalUsageChartSkeleton } from "./total-usage-chart"
import { Cookie9 } from "./svg/shapes/Cookie9"

export function ProfileCardSkeleton() {
  return (
    <VStack>
      <HStack
        className="h-20 gap-4 rounded-xl max-w-lg w-full mx-auto shadow-md shadow-card/50 border-2 border-card-foreground/10 bg-card p-1 md:p-4 justify-between md:min-h-32"
        alignItems="center"
      >
        <Cookie9 className="h-20 w-20 animate-pulse fill-accent" />
        <VStack className="flex-1 h-full justify-start py-2">
          <Skeleton className="h-5 md:h-6 w-3/4 rounded-sm" />
        </VStack>
        <TotalUsageChartSkeleton />
      </HStack>
    </VStack>
  )
}
