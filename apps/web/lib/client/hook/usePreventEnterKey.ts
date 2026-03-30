"use client"
import { DependencyList, useLayoutEffect } from "react"

export function usePreventEnterKey(
  element: HTMLElement,
  callback: () => void,
  deps?: DependencyList,
) {
  useLayoutEffect(() => {
    element.addEventListener("keydown", handleKeyDown)
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "enter") {
        event.preventDefault()
        callback()
      }
    }

    return () => {
      element.removeEventListener("keydown", handleKeyDown)
    }
  }, deps)
}
