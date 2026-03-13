"use client"

import { ZStack, ZStackGrid } from "./layout"
import { Cookie9, pathData as cookie9PathData } from "./svg/shapes/Cookie9"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { DrawSVGPlugin, MorphSVGPlugin } from "gsap/all"
import { useRef, useState } from "react"
import { Circle, pathData as circlePathData } from "./svg/shapes/Circle"

import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { LoadingSpinner } from "./loading-spinner"
import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP, DrawSVGPlugin, MorphSVGPlugin)

const chartOffsetPathPercentage = 5.5

function AnimatedChartPart({
  usagePercentage,
  offset,
  className,
}: {
  usagePercentage: number
  offset: number
  className?: string
}) {
  const maskRef = useRef<SVGPathElement>(null)

  useGSAP(() => {
    if (!maskRef.current) return

    const chartOffset =
      usagePercentage >= 100 || usagePercentage <= 0 ? 0 : offset
    // Animate the mask reveal
    gsap.fromTo(
      maskRef.current,
      { drawSVG: `${chartOffset}%` },
      {
        drawSVG: `${chartOffset}% ${usagePercentage - chartOffset}%`,
        duration: 1.5,
        ease: "power2.out",
      },
    )
  })

  return (
    <svg
      width="380"
      height="380"
      viewBox="0 0 380 380"
      className={cn("overflow-visible", className)}
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Mask for the chart part, to make the spinning part have rounded edges */}
        <mask id="fixed-mask" maskUnits="userSpaceOnUse">
          <path
            d={circlePathData}
            fill="none"
            stroke="white"
            strokeLinecap="round"
            ref={maskRef}
            className="stroke-[5.5rem]"
          />
        </mask>
      </defs>

      {/* The spinning part of the chart */}
      <g mask="url(#fixed-mask)">
        <path
          d={cookie9PathData}
          fill="none"
          stroke="currentColor"
          className="stroke-primary origin-center stroke-[3.5rem] animate-spin"
          style={{ transformOrigin: "center", animationDuration: "10s" }}
        />
      </g>
    </svg>
  )
}

export function TotalUsageChartSkeleton({ className }: { className?: string }) {
  return (
    <ZStackGrid className={cn("h-18 aspect-square", className)}>
      <div className="h-full w-full flex justify-center items-center text-xs font-semibold">
        <LoadingSpinner className="h-8 w-8 bg-accent" />
      </div>
      <Circle
        className="h-full w-full fill-transparent stroke-[5.5rem] stroke-background/10 rotate-90 animate-pulse"
        style={{ overflow: "visible" }}
      />
      <Circle
        className="h-full w-full fill-transparent stroke-[5.5rem] stroke-background/10 rotate-90 animate-pulse"
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
  const arcRef = useRef<SVGSVGElement>(null)

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
    if (!arcRef.current) return
    const arc = arcRef.current
    const arcPath = arc.querySelector("path")

    const chartOffset =
      remainingPercentageNum >= 100 || remainingPercentageNum <= 0
        ? 0
        : chartOffsetPathPercentage
    gsap.fromTo(
      arcPath,
      {
        drawSVG: `${chartOffset}%`,
      },
      {
        drawSVG: `-${chartOffset}% -${remainingPercentageNum - chartOffset}%`,
      },
    )
  })
  return (
    <Popover open={isOpen}>
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
            <AnimatedChartPart
              offset={chartOffsetPathPercentage}
              usagePercentage={usagePercentageNum}
              className="h-full w-full rotate-70"
            />

            <Circle
              className="h-full w-full fill-transparent stroke-[5.1rem] stroke-accent rotate-70 origin-center"
              ref={arcRef}
              style={{ overflow: "visible" }}
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
