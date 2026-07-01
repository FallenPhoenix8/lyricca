"use client"

import { ZStackGrid } from "./layout"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { DrawSVGPlugin, MorphSVGPlugin } from "gsap/all"
import { useRef, useState } from "react"

import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { LoadingSpinner } from "./loading-spinner"
import { cn } from "@/lib/utils"
import { getShapePathData } from "./svg/shapes/shapes"
import { Shape, ShapeFrame } from "./svg/shapes/Shape"
import { m3ExpressiveDuration, m3ExpressiveSpring } from "./constants"
import { useM3Motion } from "@/lib/client/hook/useM3Motion"

gsap.registerPlugin(useGSAP, DrawSVGPlugin, MorphSVGPlugin)

export function TotalUsageChartSkeleton({ className }: { className?: string }) {
  return (
    <ZStackGrid className={cn("h-18 aspect-square", className)}>
      <div className="h-full w-full flex justify-center items-center text-xs font-semibold">
        <LoadingSpinner className="h-8 w-8 bg-accent" />
      </div>
      <Shape
        className="h-full w-full fill-transparent stroke-[5.5rem] stroke-background/10 rotate-90 animate-pulse"
        style={{ overflow: "visible" }}
        shape="Circle"
      />
      <Shape
        className="h-full w-full fill-transparent stroke-[5.5rem] stroke-background/10 rotate-90 animate-pulse"
        style={{ overflow: "visible" }}
        shape="Circle"
      />
      <Shape
        className="h-full w-full fill-transparent stroke-[2.5rem] stroke-accent rotate-90 origin-center animate-pulse"
        shape="Circle"
      />
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
  useM3Motion()
  const [isOpen, setIsOpen] = useState(false)
  // * MARK: - Prepare references for chart elements
  const arcOuterRef = useRef<SVGPathElement>(null)

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
    if (!arcOuterRef.current) return

    const tl = gsap.timeline({
      defaults: {
        duration: m3ExpressiveDuration.spatial.slow.seconds,
        ease: m3ExpressiveSpring.spatial.slow.gsap,
      },
    })

    tl.fromTo(
      arcOuterRef.current,
      { drawSVG: 0 },
      { drawSVG: `${usagePercentageNum}%` },
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
          <ZStackGrid className="p-1 rotate-x-180 rotate-90" aria-hidden>
            <ShapeFrame className="h-full w-full fill-transparent stroke-[5.1rem] text-accent origin-center overflow-visible">
              <path
                d={getShapePathData("Circle")}
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
              />
            </ShapeFrame>
            <ShapeFrame className="h-full w-full fill-transparent stroke-[5.1rem] text-primary origin-center overflow-visible rotate-180 scale-105">
              <path
                d={getShapePathData("Circle")}
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                ref={arcOuterRef}
              />
            </ShapeFrame>
          </ZStackGrid>
        </ZStackGrid>
      </PopoverTrigger>
      <PopoverContent>
        <label
          htmlFor="translation-usage-percentage"
          className="uppercase text-xs font-semibold text-muted-foreground mb-2"
        >
          Shared Translation Usage Left
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
          Limit will be refreshed in {daysRemaining} days. <br />
          It's shared between all users.
        </p>
      </PopoverContent>
    </Popover>
  )
}
