"use client"
import React, { DependencyList, useLayoutEffect } from "react"

export function usePreventEnterKey(
  element: React.RefObject<HTMLElement | null>,
  callback: () => void,
  deps?: DependencyList,
) {
  useLayoutEffect(() => {
    if (!element.current) return
    element.current.addEventListener("keydown", handleKeyDown)
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "enter") {
        event.preventDefault()
        callback()
      }
    }

    return () => {
      element.current?.removeEventListener("keydown", handleKeyDown)
    }
  }, [element, deps])
}
