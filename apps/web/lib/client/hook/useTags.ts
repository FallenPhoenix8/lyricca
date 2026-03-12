"use client"
import { useState, useRef } from "react"

export function useTags(limit: number = 2) {
  const [tags, setTags] = useState<string[]>([])

  function push(tag: string) {
    let newTags = [...tags]
    newTags.unshift(tag)
    if (newTags.length > limit) {
      newTags.pop()
    }
    setTags(newTags)
  }

  function clear() {
    setTags([])
  }

  function includes(tag: string) {
    return tags.includes(tag)
  }

  const value = useRef(tags)
  return { value, push, clear, includes }
}
