"use client"
import { useState, useRef, startTransition } from "react"

export function useTags(limit: number = 2) {
  const [tags, setTags] = useState<
    { type: "artist" | "album"; value: string }[]
  >([])

  function pushTag(type: "artist" | "album", tag: string) {
    startTransition(() => {
      setTags((prev) => {
        if (isIncludesTag(tag)) {
          return prev.filter((t) => t.value.toLowerCase() !== tag.toLowerCase())
        }
        const newTags = [...prev]
        newTags.unshift({ type, value: tag })
        if (newTags.length > limit) {
          newTags.pop()
        }
        return newTags
      })
    })
  }

  function isIncludesTag(tag: string) {
    return tags.map((t) => t.value.toLowerCase()).includes(tag.toLowerCase())
  }

  return {
    tags,
    pushTag,
    isIncludesTag,
  }
}
