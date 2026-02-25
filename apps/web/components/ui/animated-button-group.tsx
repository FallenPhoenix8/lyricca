"use client"
import { HStack, ZStack } from "@/components/ui/layout"
import { ButtonHTMLAttributes, useMemo, useRef, useState } from "react"
import { Button } from "./button"
import { useLayoutEffect } from "react"
import { useWindowDimensions } from "@/lib/client/hook/useWindowDimensions"
import Link from "next/link"
import clsx from "clsx"

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

function getInitialActiveIndex(buttons: ButtonGroupItem[]) {
  const initialActiveIndex = buttons.findIndex((btn) => btn.isInitialActive)
  return initialActiveIndex !== -1 ? initialActiveIndex : 0
}

/**
 * The ButtonGroup component renders a group of buttons or links with a selection background that highlights the active button. The active button is determined by the `isInitialActive` property of each button, or by the first button if no button is marked as initial active. The component also adjusts the layout and content of the buttons based on the window width, showing only icons in compact mode.
 */
export default function AnimatedButtonGroup({
  buttons,
  backgroundOffset = 4,
}: {
  buttons: ButtonGroupItem[]
  backgroundOffset?: number
}) {
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
  return (
    <ZStack className="bg-secondary/20 rounded-sm w-min shadow-md">
      {/* MARK: - Render selection background */}
      <div
        className="absolute inset-x-0 bottom-0 bg-secondary transition-[top, left, width, height] duration-300 ease-in-out left-0 top-0 h-0 w-0 rounded-lg shadow-sm -z-10"
        ref={selectionBackgroundRef}
      ></div>
      {/* MARK: - Render buttons */}
      <HStack className="gap-2 px-2 py-2" ref={buttonsContainerRef}>
        {buttons.map((button, index) => {
          const isActive = index === activeButtonIndex
          const content = (
            <Button
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
              className="transition-colors duration-300"
            >
              {isCompact ? (
                button.icon
              ) : (
                <HStack className="gap-1 items-center-safe">
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
    </ZStack>
  )
}
