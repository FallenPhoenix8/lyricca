"use client"

import { useEffect, useState } from "react"

type WindowDims = { width: number; height: number }

function getWindowDimensions(): WindowDims | undefined {
  if (typeof window === "undefined") return undefined
  return { width: window.innerWidth, height: window.innerHeight }
}

export function useWindowDimensions() {
  const [dims, setDims] = useState<WindowDims | undefined>(undefined)

  useEffect(() => {
    const update = () => setDims(getWindowDimensions())
    update() // set once on mount
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return dims
}
