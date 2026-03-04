"use client"
import { HStack } from "@/components/ui/layout"
import { useSongs } from "@/lib/client/hook/useSongs"
import { useEffect } from "react"

export default function LibraryPage() {
  const { songs } = useSongs()

  useEffect(() => {
    console.log(songs)
  }, [songs])
  return (
    <>
      <HStack>
        <h2 className="app-title-heading">Library</h2>
      </HStack>
    </>
  )
}
