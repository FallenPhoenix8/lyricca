"use client"

import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { MorphSVGPlugin } from "gsap/all"
import { cn } from "@/lib/utils"
import { useRef } from "react"
import { useM3Motion } from "@/lib/client/hook/useM3Motion"
import { m3ExpressiveDuration, m3ExpressiveSpring } from "./constants"
import { getShapePathData } from "./svg/shapes/shapes"

const shapePaths = [
  getShapePathData("Pill"),
  getShapePathData("Triangle"),
  getShapePathData("4-sided cookie"),
  getShapePathData("Pentagon"),
]

gsap.registerPlugin(useGSAP, MorphSVGPlugin)

export function MorphingShapes({ className }: { className?: string }) {
  useM3Motion()
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
          duration: m3ExpressiveDuration.spatial.default.seconds,
          ease: m3ExpressiveSpring.spatial.default.gsap,
          rotate: "+=360",
          transformOrigin: "center",
        })
      })
    },
    { scope: shapePathRef },
  )

  return (
    <svg
      viewBox="0 0 380 380"
      className={cn("h-10 w-10 fill-primary-foreground", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={shapePaths[0]} ref={shapePathRef} />
    </svg>
  )
}
