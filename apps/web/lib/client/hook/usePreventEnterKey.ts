"use client"
import { DependencyList, useLayoutEffect } from "react"

export function usePreventEnterKey(
  callback: () => void,
  deps?: DependencyList,
) {
  useLayoutEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "enter") {
        event.preventDefault()
        callback()
      }
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, deps)
}
