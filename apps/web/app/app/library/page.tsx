"use client"
import { SongCardList } from "@/components/ui/song-card-list"
import { ViewTransition } from "react"

export default function LibraryPage() {
  return (
    <ViewTransition enter="replace" exit="replace">
      <ViewTransition name="blur-overlay">
        <div className="fixed top-0 right-0 left-0 h-0 bg-background/65 backdrop-blur-lg"></div>
      </ViewTransition>
      <SongCardList />
    </ViewTransition>
  )
}
