import { createContext, useContext } from "react"
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
  const value = useSongs()
  return <SongsContext.Provider value={value}>{children}</SongsContext.Provider>
}
