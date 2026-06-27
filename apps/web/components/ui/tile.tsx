"use client"

import { cn } from "@/lib/utils"
import { DynamicIcon, IconName } from "lucide-react/dynamic"
import { useRef, useState } from "react"
import { m3ExpressiveDuration, m3ExpressiveSpring } from "./constants"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ZStackGrid } from "./layout"
import { Shape, ShapeFrame } from "./svg/shapes/Shape"
import { getShapePathData, Shape as ShapeType } from "./svg/shapes/shapes"
import { MorphSVGPlugin } from "gsap/all"
import { useWebHaptics } from "web-haptics/react"

gsap.registerPlugin(useGSAP)
export function Tile({
  isActive,
  setIsActive,
  icon,
  activeIcon = icon,
  children,
  isCompact = true,
  subtitle,
  ...props
}: React.ComponentProps<"button"> & {
  isActive: boolean
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>
  icon: IconName
  activeIcon?: IconName
  isCompact?: boolean
  subtitle?: React.ReactNode
  ref?: React.Ref<HTMLButtonElement>
}) {
  const { trigger } = useWebHaptics({ debug: true })
  const activeIconBackgroundShape: ShapeType = "6-sided cookie"
  const inactiveIconBackgroundShape: ShapeType = "Square"
  const shape = isActive
    ? activeIconBackgroundShape
    : inactiveIconBackgroundShape
  const shapePathRef = useRef<SVGPathElement>(null)
  const iconElementRef = useRef<SVGSVGElement>(null)
  const activeIconElementRef = useRef<SVGSVGElement>(null)

  function handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault()
    trigger([{ duration: 15 }], { intensity: 0.4 }) // Trigger light haptic feedback on click
    setIsActive((prev) => !prev)
    props.onClick?.(event)
  }

  useGSAP(() => {
    if (!shapePathRef.current) return
    gsap.to(shapePathRef.current, {
      morphSVG: getShapePathData(shape),
      duration: m3ExpressiveDuration.spatial.default.seconds,
      ease: m3ExpressiveSpring.spatial.default.gsap,
    })
  }, [isActive])
  return (
    <button
      type="button"
      {...props}
      onClick={handleClick}
      className={cn(
        "overflow-hidden cursor-pointer min-w-fit",
        m3ExpressiveDuration.spatial.slow.className,
        m3ExpressiveSpring.spatial.slow.className,
        "transition-[border-radius]",
        isActive ? "rounded-[64px]" : "rounded-[20px]",
        !isCompact && "flex-1",
        props.className,
      )}
    >
      <div
        className={cn(
          m3ExpressiveSpring.effect.default.className,
          m3ExpressiveDuration.effect.default.className,
          "flex justify-center items-center gap-2.5 h-full w-full transition-[background-color,color]",
          "px-5 py-3",
          isActive
            ? "bg-primary text-primary-foreground"
            : "bg-card text-card-foreground",
          "drop-shadow-sm drop-shadow-black/50",
        )}
      >
        <ZStackGrid className="place-items-center">
          <ShapeFrame
            className={cn(
              "size-12 fill-secondary transition-[rotate]",
              m3ExpressiveDuration.spatial.default.className,
              m3ExpressiveSpring.spatial.default.className,
              isActive ? "rotate-360" : "rotate-0",
            )}
          >
            <path
              d={getShapePathData(shape)}
              fill="inherit"
              ref={shapePathRef}
            />
          </ShapeFrame>
          <ZStackGrid>
            <DynamicIcon
              name={icon}
              className={cn(
                "size-6 text-secondary-foreground origin-center",
                isActive ? "opacity-0 scale-0" : "opacity-100 scale-100",
                m3ExpressiveDuration.spatial.default.className,
                m3ExpressiveSpring.spatial.default.className,
              )}
              ref={iconElementRef}
            />
            <DynamicIcon
              name={activeIcon}
              className={cn(
                "size-6 text-secondary-foreground origin-center",
                isActive ? "opacity-100 scale-100" : "opacity-0 scale-0",
                m3ExpressiveDuration.spatial.default.className,
                m3ExpressiveSpring.spatial.default.className,
              )}
              ref={activeIconElementRef}
            />
          </ZStackGrid>
        </ZStackGrid>
        {!isCompact && (
          <div className="flex flex-col gap-0.5 text-lg font-semibold flex-1 text-start">
            <span>{children}</span>
            {subtitle && (
              <span className="text-muted-foreground text-sm">{subtitle}</span>
            )}
          </div>
        )}
      </div>
    </button>
  )
}
