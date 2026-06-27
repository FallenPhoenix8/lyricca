"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"
import { ZStackGrid } from "./layout"
import { ShapeFrame } from "./svg/shapes/Shape"
import { getShapePathData, Shape } from "./svg/shapes/shapes"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { MorphSVGPlugin } from "gsap/all"
import { m3ExpressiveDuration, m3ExpressiveSpring } from "./constants"
import { DynamicIcon, IconName } from "lucide-react/dynamic"

gsap.registerPlugin(useGSAP, MorphSVGPlugin)
function Switch({
  className,
  size = "default",
  isChecked,
  onCheckedChange,
  icon = "check",
  activeIcon = "x",
  ...props
}: React.ComponentProps<"button"> & {
  isChecked: boolean
  onCheckedChange: React.Dispatch<React.SetStateAction<boolean>>
  size?: "sm" | "default" | "lg"
  icon?: IconName
  activeIcon?: IconName
}) {
  const pathRef = React.useRef<SVGPathElement>(null)
  const shapeContainerRef = React.useRef<SVGSVGElement>(null)
  const containerRef = React.useRef<HTMLButtonElement>(null)
  const stackRef = React.useRef<HTMLDivElement>(null)
  const shape: Shape = "Circle"
  const activeShape: Shape = "6-sided cookie"
  const shapePathData = React.useMemo(
    () => (isChecked ? getShapePathData(activeShape) : getShapePathData(shape)),
    [isChecked],
  )

  useGSAP(() => {
    if (
      !pathRef.current ||
      !shapeContainerRef.current ||
      !containerRef.current ||
      !stackRef.current
    )
      return

    const width = shapeContainerRef.current.getBoundingClientRect().width
    const calculatedLeft = width - 0.2 * width
    gsap.to(pathRef.current, {
      morphSVG: shapePathData,
      duration: m3ExpressiveDuration.spatial.default.seconds,
      ease: m3ExpressiveSpring.spatial.default.gsap,
    })
    gsap.to(stackRef.current, {
      left: isChecked ? calculatedLeft : 0,
      duration: m3ExpressiveDuration.spatial.default.seconds,
      ease: m3ExpressiveSpring.spatial.default.gsap,
    })
    gsap.to(shapeContainerRef.current, {
      rotate: isChecked ? "360deg" : "0deg",
      duration: m3ExpressiveDuration.spatial.default.seconds,
      ease: m3ExpressiveSpring.spatial.default.gsap,
    })
  }, [isChecked])
  return (
    /*<SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground"
        )}
      />
    </SwitchPrimitive.Root>*/
    <button
      data-slot="switch"
      data-size={size}
      data-state={isChecked ? "checked" : "unchecked"}
      type="button"
      onClick={() => {
        onCheckedChange((prev) => !prev)
      }}
      className={cn(
        "flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        "data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[size=lg]:h-9 data-[size=lg]:w-16",
        m3ExpressiveDuration.effect.default.className,
        m3ExpressiveSpring.effect.default.className,
        className,
      )}
      {...props}
      ref={containerRef}
    >
      <div
        className="relative h-full aspect-square place-items-center"
        ref={stackRef}
      >
        <ShapeFrame
          className={cn("absolute size-full origin-center")}
          ref={shapeContainerRef}
        >
          <path d={shapePathData} fill="inherit" ref={pathRef} />
        </ShapeFrame>
        <ZStackGrid className="absolute place-items-center size-full">
          <DynamicIcon
            name={activeIcon}
            className={cn(
              "size-1/2 stroke-[3px] origin-center",
              !isChecked && "opacity-0 scale-0",
              m3ExpressiveDuration.spatial.default.className,
              m3ExpressiveSpring.spatial.default.className,
            )}
          />
          <DynamicIcon
            name={icon}
            className={cn(
              "size-1/2 stroke-[3px] origin-center",
              isChecked && "opacity-0 scale-0",
              m3ExpressiveDuration.spatial.default.className,
              m3ExpressiveSpring.spatial.default.className,
            )}
          />
        </ZStackGrid>
      </div>
    </button>
  )
}

export { Switch }
