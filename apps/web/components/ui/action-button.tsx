"use client"
import React, { useRef, useState } from "react"
import { ZStackGrid } from "./layout"

import { cn } from "@/lib/utils"
import { useGSAP } from "@gsap/react"
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin"
import gsap from "gsap"
import { m3ExpressiveDuration, m3ExpressiveSpring } from "./constants"
import { CustomEase } from "gsap/all"
import { getShapePathData, type Shape } from "@/components/ui/svg/shapes/shapes"
import { useM3Motion } from "@/lib/client/hook/useM3Motion"
import { useWebHaptics } from "web-haptics/react"
import { DynamicIcon, type IconName } from "lucide-react/dynamic"

gsap.registerPlugin(useGSAP, MorphSVGPlugin, CustomEase)

export function ActionButton({
  initialShape = "Square",
  initialRotation = 45,
  activeShape = "Pentagon",
  activeRotation = 180,
  icon,
  ...props
}: React.ComponentProps<"div"> & {
  initialShape?: Shape
  activeShape?: Shape
  initialRotation?: number
  activeRotation?: number
  icon: IconName
}) {
  useM3Motion()
  const { trigger } = useWebHaptics({ debug: false })
  const [shape, setShape] = useState<Shape>(initialShape)
  const transitionDurationType = useRef<"touch" | "hover">("hover")
  const durationSpatial = m3ExpressiveDuration.spatial.default.seconds
  const easeSpatial = m3ExpressiveSpring.spatial.default.gsap
  const pathRef = useRef<SVGPathElement>(null)
  const shapeGroupRef = useRef<SVGGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useGSAP(
    () => {
      const path = pathRef.current
      const group = shapeGroupRef.current
      const container = containerRef.current
      const svg = svgRef.current

      if (!path || !group || !container || !svg) return

      gsap.killTweensOf([path, group, container])

      const tl = gsap.timeline({
        defaults: {
          duration: durationSpatial,
          ease: easeSpatial,
          overwrite: true,
        },
      })

      tl.to(
        path,
        {
          morphSVG: getShapePathData(shape),
        },
        0,
      )

      tl.to(
        svg,
        {
          fill: shape === initialShape ? "var(--secondary)" : "var(--primary)",
          duration:
            transitionDurationType.current === "touch"
              ? m3ExpressiveDuration.effect.fast.seconds
              : m3ExpressiveDuration.effect.default.seconds,
          ease:
            transitionDurationType.current === "touch"
              ? m3ExpressiveSpring.effect.fast.gsap
              : m3ExpressiveSpring.effect.default.gsap,
        },
        0,
      )

      tl.to(
        group,
        {
          rotation: shape === initialShape ? initialRotation : activeRotation,
          svgOrigin: "190 190",
        },
        0,
      )

      tl.to(
        container,
        {
          scale: shape === initialShape ? 1 : 1.1,
          transformOrigin: "50% 50%",
        },
        0,
      )
    },
    { dependencies: [shape] },
  )
  return (
    <>
      <ZStackGrid
        onMouseEnter={() => {
          transitionDurationType.current = "hover"
          setShape(activeShape)
        }}
        onMouseLeave={() => {
          transitionDurationType.current = "hover"
          setShape(initialShape)
        }}
        ref={containerRef}
        {...props}
        className={cn(
          "w-9 h-9 aspect-square place-items-center cursor-pointer",
          props.className,
        )}
        onClick={(event) => {
          trigger([{ duration: 15 }], { intensity: 0.4 }) // Trigger light haptic feedback on click
          props.onClick?.(event)
        }}
      >
        <svg
          width="380"
          height="380"
          viewBox="0 0 380 380"
          xmlns="http://www.w3.org/2000/svg"
          className="fill-secondary w-full h-full aspect-square stroke-[1.5rem] stroke-border overflow-visible"
          ref={svgRef}
        >
          <g ref={shapeGroupRef}>
            <path
              d={getShapePathData(initialShape)}
              fill="inherit"
              ref={pathRef}
            />
          </g>
        </svg>
        <button
          onFocus={() => {
            transitionDurationType.current = "touch"
            setShape(activeShape)
          }}
          onBlur={() => {
            transitionDurationType.current = "touch"
            setShape(initialShape)
          }}
          className={cn(
            "flex justify-center items-center cursor-pointer text-secondary-foreground h-full w-full",
            shape === activeShape && "text-primary-foreground -translate-y-0.5",
            m3ExpressiveDuration.effect.default.className,
          )}
          type="button"
        >
          <DynamicIcon name={icon} strokeWidth="2px" size={16} />
        </button>
      </ZStackGrid>
    </>
  )
}
