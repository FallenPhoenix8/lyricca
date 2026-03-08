"use client"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { SongCardList } from "@/components/ui/song-card-list"
import { ViewTransition } from "react"

export default function LibraryPage() {
  return (
    <>
      <ViewTransition default="auto">
        <Breadcrumb className="my-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Library</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <SongCardList />
      </ViewTransition>
    </>
  )
}
