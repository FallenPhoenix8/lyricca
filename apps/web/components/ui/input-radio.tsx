"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { ZStackGrid } from "./layout"
import { Shape, ShapeFrame } from "./svg/shapes/Shape"
import { getShapePathData } from "./svg/shapes/shapes"
import { useGSAP } from "@gsap/react"
import { MorphSVGPlugin } from "gsap/all"
import gsap from "gsap"
import { useM3Motion } from "@/lib/client/hook/useM3Motion"
import { m3ExpressiveDuration, m3ExpressiveSpring } from "./constants"
import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP, MorphSVGPlugin)
export function InputRadio({
  className,
  activeValue,
  setActiveValue,
  ...props
}: React.ComponentProps<"input"> & {
  activeValue: string
  setActiveValue: React.Dispatch<React.SetStateAction<string>>
}) {
  useM3Motion()
  const activeShapeRef = useRef<SVGSVGElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isChecked = activeValue === props.value
  const [isFirstRender, setIsFirstRender] = useState(true)

  useGSAP(
    () => {
      if (isFirstRender) return
      //   gsap.to("g", {
      //     scale: isChecked ? 1 : 0,
      //     duration: m3ExpressiveDuration.spatial.default.seconds,
      //     ease: m3ExpressiveSpring.spatial.default.gsap,
      //   })
      gsap.to("path", {
        morphSVG: isChecked
          ? getShapePathData("6-sided cookie")
          : getShapePathData("Circle"),
        duration: m3ExpressiveDuration.spatial.fast.seconds,
        ease: m3ExpressiveSpring.spatial.fast.gsap,
      })
    },
    {
      scope: activeShapeRef,
      dependencies: [inputRef.current?.checked, inputRef],
    },
  )

  useEffect(() => {
    console.log({
      activeValue,
      value: props.value,
      isChecked,
    })
  }, [isChecked])

  useLayoutEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false)
    }
  }, [])
  return (
    <ZStackGrid
      className={cn("place-items-center disabled:opacity-50", className)}
    >
      <Shape shape="Circle" className="size-8 fill-border" />
      <Shape shape="Circle" className="size-7 fill-card" />
      <ShapeFrame
        className={cn(
          "size-7.5 fill-primary origin-center",
          m3ExpressiveDuration.spatial.default.className,
          m3ExpressiveSpring.spatial.default.className,
          isFirstRender && "scale-0",
          isChecked ? "scale-100" : "scale-0",
        )}
        ref={activeShapeRef}
      >
        <g>
          <path
            d={getShapePathData(isChecked ? "6-sided cookie" : "Circle")}
            fill="inherit"
          />
        </g>
      </ShapeFrame>
      <input
        type="radio"
        className="size-8 opacity-0 cursor-pointer disabled:cursor-not-allowed"
        ref={inputRef}
        checked={isChecked}
        onChange={(event) => {
          console.log("Changing value...")
          setActiveValue(event.target.value)
        }}
        {...props}
      />
    </ZStackGrid>
  )
}
