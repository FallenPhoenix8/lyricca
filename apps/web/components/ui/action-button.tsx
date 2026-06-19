"use client"
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { ZStackGrid } from "./layout"
import { Button } from "./button"
import { Icon, IconNode, UploadIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGSAP } from "@gsap/react"
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin"
import gsap from "gsap"
import { easeOvershootClassName, easeOvershootGSAP } from "./constants"
import { CustomEase } from "gsap/all"
import { pathData as trianglePathData } from "@/components/ui/svg/shapes/Triangle"
import { pathData as pillPathData } from "@/components/ui/svg/shapes/Pill"
import { pathData as pentagonPathData } from "@/components/ui/svg/shapes/Pentagon"
import { pathData as hexagonPathData } from "@/components/ui/svg/shapes/Hexagon"
import { pathData as cookie9PathData } from "@/components/ui/svg/shapes/Cookie9"
import { pathData as cookie8PathData } from "@/components/ui/svg/shapes/Cookie8"
import { pathData as cookie4PathData } from "@/components/ui/svg/shapes/Cookie4"
import { pathData as circlePathData } from "@/components/ui/svg/shapes/Circle"

type Shape =
  | "triangle"
  | "pill"
  | "pentagon"
  | "hexagon"
  | "cookie-9"
  | "cookie-8"
  | "cookie-4"
  | "circle"

function getPathData(shape: Shape) {
  switch (shape) {
    case "triangle":
      return trianglePathData
    case "pill":
      return pillPathData
    case "pentagon":
      return pentagonPathData
    case "hexagon":
      return hexagonPathData
    case "cookie-9":
      return cookie9PathData
    case "cookie-8":
      return cookie8PathData
    case "cookie-4":
      return cookie4PathData
    case "circle":
      return circlePathData
    default:
      throw new Error(`Invalid shape: ${shape}`)
  }
}

gsap.registerPlugin(useGSAP)
gsap.registerPlugin(MorphSVGPlugin)
gsap.registerPlugin(CustomEase)

export function ActionButton(
  props: React.ComponentProps<"div"> & { children: React.ReactNode },
) {
  const defaultShape: Shape = "cookie-9"
  const activeShape: Shape = "pentagon"
  const [shape, setShape] = useState<Shape>(defaultShape)
  const transitionDurationType = useRef<"touch" | "hover">("hover")
  const touchTransitionDuration = 0.3
  const hoverTransitionDuration = 0.4
  const duration = useCallback(
    () =>
      transitionDurationType.current === "touch"
        ? touchTransitionDuration
        : hoverTransitionDuration,
    [touchTransitionDuration, hoverTransitionDuration],
  )
  const pathRef = useRef<SVGPathElement>(null)
  const shapeGroupRef = useRef<SVGGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const path = pathRef.current
      const group = shapeGroupRef.current
      const container = containerRef.current

      if (!path || !group || !container) return

      gsap.killTweensOf([path, group, container])

      const tl = gsap.timeline({
        defaults: {
          duration: duration(),
          ease: "easeOvershoot",
          overwrite: true,
        },
      })

      tl.to(
        path,
        {
          morphSVG: getPathData(shape),
        },
        0,
      )

      tl.to(
        group,
        {
          rotation: shape === defaultShape ? 0 : 180,
          svgOrigin: "190 190",
        },
        0,
      )

      tl.to(
        container,
        {
          scale: shape === defaultShape ? 1 : 1.1,
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
          setShape("pentagon")
        }}
        onMouseLeave={() => {
          transitionDurationType.current = "hover"
          setShape(defaultShape)
        }}
        ref={containerRef}
        {...props}
        className={cn(
          "w-13 h-13 aspect-square place-items-center cursor-pointer",
          props.className,
        )}
      >
        <svg
          width="380"
          height="380"
          viewBox="0 0 380 380"
          xmlns="http://www.w3.org/2000/svg"
          className="fill-secondary w-full h-16 aspect-square stroke-[1.5rem] stroke-border"
        >
          <g ref={shapeGroupRef}>
            <path d={getPathData(defaultShape)} fill="inherit" ref={pathRef} />
          </g>
        </svg>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            shape === defaultShape ? "translate-y-0.5" : "-translate-y-0.5",
            `duration-[${duration()}s]`,
            easeOvershootClassName,
          )}
          onFocus={() => {
            transitionDurationType.current = "touch"
            setShape("pentagon")
          }}
          onBlur={() => {
            transitionDurationType.current = "touch"
            setShape(defaultShape)
          }}
        >
          {props.children}
        </Button>
      </ZStackGrid>
    </>
  )
}
