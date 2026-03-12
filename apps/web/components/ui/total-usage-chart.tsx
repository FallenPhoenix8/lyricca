"use client"

import { ZStack, ZStackGrid } from "./layout"
import { Cookie9 } from "./svg/shapes/Cookie9"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { DrawSVGPlugin } from "gsap/all"
import { useRef, useState } from "react"
import { Circle } from "./svg/shapes/Circle"

import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { LoadingSpinner } from "./loading-spinner"
import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP, DrawSVGPlugin)

export function TotalUsageChartSkeleton({ className }: { className?: string }) {
  return (
    <ZStackGrid className={cn("h-18 aspect-square", className)}>
      <div className="h-full w-full flex justify-center items-center text-xs font-semibold">
        <LoadingSpinner className="h-8 w-8 bg-accent" />
      </div>
      <Circle
        className="h-full w-full fill-transparent stroke-[4.5rem] stroke-background/10 rotate-90 animate-pulse"
        style={{ overflow: "visible" }}
      />
      <Circle
        className="h-full w-full fill-transparent stroke-[4.5rem] stroke-background/10 rotate-90 animate-pulse"
        style={{ overflow: "visible" }}
      />
      <Circle className="h-full w-full fill-transparent stroke-[2.5rem] stroke-accent rotate-90 origin-center animate-pulse" />
    </ZStackGrid>
  )
}
export function TotalUsageChart({
  currentUsage,
  limitUsage,
}: {
  currentUsage: number
  limitUsage: number
}) {
  const [isOpen, setIsOpen] = useState(false)
  // * MARK: - Prepare references for chart elements
  const chartRef = useRef<SVGSVGElement>(null)
  const arcRef = useRef<SVGSVGElement>(null)
  const innerBorderRef = useRef<SVGSVGElement>(null)
  const outerBorderRef = useRef<SVGSVGElement>(null)

  // * MARK: - Calculate percentages and display values
  const usageLeft = limitUsage - currentUsage
  const usagePercentageNum = (usageLeft / limitUsage) * 100
  const remainingPercentageNum = 100 - usagePercentageNum
  const formattedPercentage =
    usagePercentageNum >= 100 ? "100%" : `${usagePercentageNum.toFixed(1)}%`
  const formattedUsageLeft = usageLeft.toLocaleString("en-US")
  const formattedLimitUsage = limitUsage.toLocaleString("en-US")

  // * MARK: - Calculate beginning of new usage cycle
  const now = new Date()
  const nextUsageCycleStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  // Calculate difference in milliseconds
  const diffInMs = nextUsageCycleStart.getTime() - now.getTime()

  // Convert milliseconds to days
  // 1000ms * 60s * 60m * 24h = 86,400,000 ms per day
  const daysRemaining = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
  useGSAP(() => {
    if (
      !chartRef.current ||
      !arcRef.current ||
      !innerBorderRef.current ||
      !outerBorderRef.current
    )
      return
    const chart = chartRef.current
    const chartPath = chart.querySelector("path")
    const arc = arcRef.current
    const arcPath = arc.querySelector("path")
    const innerBorder = innerBorderRef.current
    const innerBorderPath = innerBorder.querySelector("path")
    const outerBorder = outerBorderRef.current
    const outerBorderPath = outerBorder.querySelector("path")

    const tl = gsap.timeline()

    gsap.fromTo(
      innerBorderPath,
      {
        drawSVG: "0",
      },
      {
        drawSVG: `-${remainingPercentageNum}%`,
        // duration: 0,
      },
    )

    gsap.fromTo(
      outerBorderPath,
      {
        drawSVG: "0",
      },
      {
        drawSVG: `-${remainingPercentageNum}%`,
        // duration: 0,
      },
    )

    gsap.fromTo(
      chartPath,
      {
        drawSVG: "0",
      },
      {
        drawSVG: "100%",
      },
    )
    gsap.fromTo(
      arcPath,
      {
        drawSVG: "0",
      },
      {
        drawSVG: `-${remainingPercentageNum}%`,
      },
    )
  })
  return (
    <Popover
      open={isOpen}
      onOpenChange={() =>
        console.log(isOpen ? "Popover opened" : "Popover closed")
      }
    >
      <PopoverTrigger
        asChild
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onTouchStart={() => setIsOpen(true)}
        onTouchEnd={() => setIsOpen(false)}
        onContextMenu={(event) => event.preventDefault()}
      >
        <ZStackGrid className="h-full aspect-square">
          <div
            className="h-full w-full flex justify-center items-center text-[0.60rem] font-semibold"
            aria-label="Translations usage left"
          >
            {formattedPercentage}
          </div>
          <ZStackGrid className="p-1 rotate-x-180 rotate-y-180" aria-hidden>
            <Cookie9
              className="h-full w-full fill-transparent stroke-[2rem] stroke-accent-foreground animate-spin"
              style={{ animationDuration: "10s", scale: "-1 -1" }}
              ref={chartRef}
            />
            <Circle
              className="h-full w-full fill-transparent stroke-[4.5rem] stroke-background rotate-90"
              style={{ overflow: "visible" }}
              ref={innerBorderRef}
            />
            <Circle
              className="h-full w-full fill-transparent stroke-[4.5rem] stroke-background rotate-90"
              style={{ overflow: "visible" }}
              ref={outerBorderRef}
            />
            <Circle
              className="h-full w-full fill-transparent stroke-[2.5rem] stroke-accent rotate-90 origin-center"
              ref={arcRef}
            />
          </ZStackGrid>
        </ZStackGrid>
      </PopoverTrigger>
      <PopoverContent>
        <label
          htmlFor="translation-usage-percentage"
          className="uppercase text-xs font-semibold text-muted-foreground mb-2"
        >
          Translation Usage Left
        </label>
        <p
          className="font-semibold text-center"
          id="translation-usage-percentage"
        >
          {formattedUsageLeft} <span className="text-xl font-normal">/</span>{" "}
          {formattedLimitUsage}
        </p>
        <p className="text-xs text-center font-semibold">characters left</p>
        <p className="text-xs text-center mt-2">
          Limit will be refreshed in {daysRemaining} days.
        </p>
      </PopoverContent>
    </Popover>
  )
}
