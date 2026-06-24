"use client"
import { HStack, ZStack, ZStackGrid } from "@/components/ui/layout"
import {
  ButtonHTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { Button } from "./button"
import { useLayoutEffect } from "react"
import { useWindowDimensions } from "@/lib/client/hook/useWindowDimensions"
import Link from "next/link"
import clsx from "clsx"
import { cn } from "@/lib/utils"
import { useM3Motion } from "@/lib/client/hook/useM3Motion"
import { m3ExpressiveDuration, m3ExpressiveSpring } from "./constants"
import { useGSAP } from "@gsap/react"
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin"
import gsap from "gsap"
import { Shape } from "./svg/shapes/Shape"
import { getShapePathData, Shape as ShapeType } from "./svg/shapes/shapes"
import { Library } from "lucide-react"
import { ViewTransition } from "react"
import { DynamicIcon, IconName } from "lucide-react/dynamic"

/**
 * A button group item is a button or a link that can be used as a part of a button group. It can be either a button or a link, and it can have a label and an icon.
 */
export type ButtonGroupItem = (
  | {
      role: "button"
      onClick: () => void
    }
  | {
      role: "link"
      href: string
    }
) & {
  label: string
  icon: React.ReactNode
  isInitialActive: boolean
  className?: string
}

export type LinkItem = {
  href: string
  label: string
  icon: React.ReactNode
  isInitialActive: boolean
  className?: string
}

export type BouncyButtonItem = {
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  label: string
  icon: IconName
  isInitialActive: boolean
  className?: string
}

function getInitialActiveIndex(buttons: ButtonGroupItem[]) {
  const initialActiveIndex = buttons.findIndex((btn) => btn.isInitialActive)
  return initialActiveIndex !== -1 ? initialActiveIndex : 0
}

/**
 * The AnimatedButtonGroup component renders a group of buttons or links with a selection background that highlights the active button. The active button is determined by the `isInitialActive` property of each button, or by the first button if no button is marked as initial active. The component also adjusts the layout and content of the buttons based on the window width, showing only icons in compact mode.
 */
export function AnimatedButtonGroup({
  buttons,
  backgroundOffset = 4,
  ref,
  ...props
}: {
  buttons: ButtonGroupItem[]
  backgroundOffset?: number
  ref?: React.Ref<HTMLDivElement>
} & React.HTMLAttributes<HTMLDivElement>) {
  useM3Motion()
  const [activeButtonIndex, setActiveButtonIndex] = useState(
    getInitialActiveIndex(buttons),
  )
  const [previousActiveButtonIndex, setPreviousActiveButtonIndex] =
    useState(activeButtonIndex)

  function updateActiveButtonIndex(newIndex: number) {
    setActiveButtonIndex((prev) => {
      setPreviousActiveButtonIndex(prev)
      return newIndex
    })
  }

  const selectionBackgroundRef = useRef<HTMLDivElement | null>(null)
  const buttonsContainerRef = useRef<HTMLDivElement | null>(null)
  const { width } = useWindowDimensions() ?? { width: 0, height: 0 }
  const isCompact = useMemo(() => width < 400, [width])

  // * MARK: - Update selection background position and size based on active button
  useLayoutEffect(() => {
    if (selectionBackgroundRef.current && buttons.length > 0) {
      const children = buttonsContainerRef.current?.children
      const activeButton = children?.[activeButtonIndex]

      if (activeButton) {
        const rect = activeButton as HTMLElement
        const width = rect.offsetWidth + backgroundOffset * 2
        const height = rect.offsetHeight + backgroundOffset * 2
        const left = rect.offsetLeft - backgroundOffset
        const top = rect.offsetTop - backgroundOffset

        selectionBackgroundRef.current.style.width = `${width}px`
        selectionBackgroundRef.current.style.height = `${height}px`
        selectionBackgroundRef.current.style.left = `${left}px`
        selectionBackgroundRef.current.style.top = `${top}px`
      }
    }
  }, [activeButtonIndex, buttons, width])

  useLayoutEffect(() => {
    const activeIndex = buttons.findIndex((btn) => btn.isInitialActive)
    if (activeIndex !== -1) {
      updateActiveButtonIndex(activeIndex)
    }
  }, [buttons])
  return (
    <div
      {...props}
      className={cn(
        "relative z-20 rounded-sm w-min shadow-md bg-card",
        props.className,
      )}
      ref={ref}
    >
      {/* MARK: - Render selection background */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-accent transition-[top, left, width, height] left-0 top-0 h-0 w-0 rounded-lg shadow-sm z-21 bg-accent",
          m3ExpressiveDuration.spatial.default.className,
          m3ExpressiveSpring.spatial.default.className,
        )}
        ref={selectionBackgroundRef}
      ></div>
      {/* MARK: - Render buttons */}
      <HStack className="gap-2 px-2 py-2" ref={buttonsContainerRef}>
        {buttons.map((button, index) => {
          const isActive = index === activeButtonIndex
          const content = (
            <Button
              type="button"
              tabIndex={button.role === "button" ? 0 : -1}
              variant={isActive ? "secondary" : "ghost"}
              size={isCompact ? "icon-sm" : "xs"}
              key={index}
              onClick={() => {
                if (button.role === "button") {
                  button.onClick()
                }
                updateActiveButtonIndex(index)
              }}
              onMouseEnter={() => {
                updateActiveButtonIndex(index)
              }}
              onMouseLeave={() => {
                updateActiveButtonIndex(previousActiveButtonIndex)
              }}
              onFocus={() => {
                updateActiveButtonIndex(index)
              }}
              onBlur={() => {
                updateActiveButtonIndex(previousActiveButtonIndex)
              }}
              className={cn(
                "transition-colors z-23",
                m3ExpressiveSpring.effect.default.className,
                m3ExpressiveDuration.effect.default.className,
              )}
            >
              {isCompact ? (
                <span className="z-100">{button.icon}</span>
              ) : (
                <HStack className="gap-1 items-center-safe z-23">
                  <div>{button.icon}</div>
                  <div>{button.label}</div>
                </HStack>
              )}
            </Button>
          )
          return button.role === "button" ? (
            content
          ) : (
            <Link
              href={button.href}
              key={index}
              onFocus={() => {
                updateActiveButtonIndex(index)
              }}
              onBlur={() => {
                updateActiveButtonIndex(previousActiveButtonIndex)
              }}
            >
              {content}
            </Link>
          )
        })}
      </HStack>
    </div>
  )
}

export function NavigationLinkGroup({
  buttons,
  backgroundOffset = 4,
}: {
  buttons: LinkItem[]
  backgroundOffset?: number
}) {
  return (
    <div className="flex gap-1">
      {buttons.map((button, index) => {
        return (
          <NavigationLink
            button={button}
            isActive={button.isInitialActive}
            key={index}
          />
        )
      })}
    </div>
  )
}

function NavigationLink(props: { button: LinkItem; isActive: boolean }) {
  return (
    <Button
      size="sm"
      className={cn(
        "flex justify-center items-center rounded-xl px-0",
        props.isActive ? "rounded-full" : " rounded-xl",
      )}
      variant={props.isActive ? "default" : "secondary"}
      type="button"
    >
      <Link
        href={props.button.href}
        className="flex h-full w-full justify-center items-center px-3"
      >
        <div>{props.button.icon}</div>
        <div className={cn("overflow-clip", !props.isActive && "max-w-0")}>
          {props.button.label}
        </div>
      </Link>
    </Button>
  )
}
