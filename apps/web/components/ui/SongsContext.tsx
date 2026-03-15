import { createContext, useContext, useState } from "react"
import { useSongs } from "@/lib/client/hook/useSongs"

export const SongsContext = createContext<
  ReturnType<typeof useSongs> | undefined
>(undefined)

export function useSongsContext() {
  const context = useContext(SongsContext)
  if (context === undefined) {
    throw new Error("useSongsContext must be used within a SongsProvider")
  }
  return context
}

export function SongsProvider({ children }: { children: React.ReactNode }) {
  // Move state here so the hook can react to it
  const [search, setSearch] = useState("")
  const [tags, setTags] = useState<
    { type: "artist" | "album"; value: string }[]
  >([])

  // The hook now only returns the MATCHING songs from IndexedDB
  const songData = useSongs(search, tags)

  const value = {
    ...songData,
    search,
    setSearch,
    tags,
    setTags,
  }

  return <SongsContext.Provider value={value}>{children}</SongsContext.Provider>
}
