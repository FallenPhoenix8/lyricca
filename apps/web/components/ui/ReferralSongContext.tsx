"use client"
import { SongDTO } from "@shared/ts-types"
import { createContext, useContext, useEffect, useState } from "react"
import { useSongsContext } from "./SongsContext"

export const ReferralSongContext = createContext<
  | {
      referralSongId: string | null
      setReferralSongId: React.Dispatch<React.SetStateAction<string | null>>
      referralSong: SongDTO | null
      referralSongListIndex: number
      setReferralSongListIndex: React.Dispatch<React.SetStateAction<number>>
    }
  | undefined
>(undefined)

export function useReferralSongContext() {
  const context = useContext(ReferralSongContext)
  if (context === undefined) {
    throw new Error(
      "useReferralSongContext must be used within a ReferralSongProvider",
    )
  }
  return context
}

export function ReferralSongProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { findOneLocally } = useSongsContext()
  const [referralSongId, setReferralSongId] = useState<string | null>(null)
  const [referralSong, setReferralSong] = useState<SongDTO | null>(null)
  const [referralSongListIndex, setReferralSongListIndex] = useState(0)

  const value = {
    referralSong,
    referralSongId,
    setReferralSongId,
    referralSongListIndex,
    setReferralSongListIndex,
  }

  useEffect(() => {
    if (referralSongId) {
      const referralSong = findOneLocally(referralSongId)
      setReferralSong(referralSong)
    }
  }, [referralSongId])

  useEffect(() => {
    console.log("referralSong changed: ", referralSong)
  }, [referralSong])

  useEffect(() => {
    console.log("referralsongListIndex changed: ", referralSongListIndex)
  }, [referralSongListIndex])
  return (
    <ReferralSongContext.Provider value={value}>
      {children}
    </ReferralSongContext.Provider>
  )
}
