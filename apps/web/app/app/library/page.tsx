"use client"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { SongCardList } from "@/components/ui/song-card-list"
import { LogoFull } from "@/components/ui/svg/LogoFull"
import { ViewTransition } from "react"

export default function LibraryPage() {
  return (
    <ViewTransition enter="replace" exit="replace">
      {/* <ViewTransition default="auto"> */}
      <ViewTransition name="blur-overlay">
        <div className="fixed top-0 right-0 left-0 h-0 bg-background/65 backdrop-blur-lg"></div>
      </ViewTransition>
      <Breadcrumb className="my-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Library</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <SongCardList />
      {/* </ViewTransition> */}
    </ViewTransition>
  )
}
