"use client"

import { pathData as pillPathData } from "./svg/shapes/Pill"
import { pathData as cookie4PathData } from "./svg/shapes/Cookie4"
import { pathData as trianglePathData } from "./svg/shapes/Triangle"
import { pathData as pentagonPathData } from "./svg/shapes/Pentagon"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { MorphSVGPlugin } from "gsap/all"
import { cn } from "@/lib/utils"
import { useRef } from "react"

const shapePaths = [
  pillPathData,
  trianglePathData,
  cookie4PathData,
  pentagonPathData,
]

gsap.registerPlugin(useGSAP, MorphSVGPlugin)

export function LoadingSpinner({ className }: { className?: string }) {
  const shapePathRef = useRef<SVGPathElement>(null)

  useGSAP(
    () => {
      const shapePath = shapePathRef.current
      if (!shapePath) return

      // * MARK: - Prepare timeline
      const tl = gsap.timeline({ repeat: -1 })

      // * MARK: - Animate towards the next path in `shapePaths`
      shapePaths.forEach((pathData, index) => {
        const nextIndex = (index + 1) % shapePaths.length
        const nextPath = shapePaths[nextIndex]

        tl.to(shapePath, {
          morphSVG: nextPath,
          duration: 1,
          ease: "power4.out",
          rotate: "+=360",
          transformOrigin: "center",
        })
      })
    },
    { scope: shapePathRef },
  )

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-primary w-8 h-8 p-1 rounded-full",
        className,
      )}
    >
      <svg
        viewBox="0 0 380 380"
        className="h-full w-full fill-primary-foreground"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={pillPathData} ref={shapePathRef} />
      </svg>
    </div>
  )
}
