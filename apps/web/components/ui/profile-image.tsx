"use client"
import Image from "next/image"
import { ZStackGrid } from "./layout"
import { useRef, useState } from "react"
import { UploadIcon } from "lucide-react"
import { Button } from "./button"
import { QueryClient, QueryClientProvider, useMutation } from "react-query"
import { ErrorResponseDTO, UserDTO } from "@shared/ts-types"
import { Result } from "@/types/Result"
import APIClient from "@/lib/data/APIClient"
import { LoadingSpinner } from "./loading-spinner"
import { cn } from "@/lib/utils"
import { m3ExpressiveDuration } from "./constants"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "./drawer"
import { useMediaQuery } from "@/lib/client/hook/useMediaQuery"

async function handleProfilePictureUpload(data: {
  file: File
  userId: string
}): Promise<Result<UserDTO, ErrorResponseDTO>> {
  const result = await APIClient.shared.patch<UserDTO>(
    `/users/${data.userId}`,
    { "profile-picture": data.file },
  )
  return result
}

function Content({
  profileURL,
  userId,
}: {
  profileURL: string | null
  userId: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [imageSource, setImageSource] = useState<string>(
    profileURL || "/default.png",
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isOpenDrawer, setIsOpenDrawer] = useState(false)
  const { mutate } = useMutation(handleProfilePictureUpload, {
    onSuccess: (result) => {
      if (!result.ok) {
        console.error("Failed to upload profile picture:", result.error)
        return
      }

      setIsLoading(false)
      setImageSource(result.value.profile_url || "/default.png")
    },
    onError: (error) => {
      console.error("Failed to upload profile picture:", error)
      setIsLoading(false)
    },
  })

  function handleImageUpload(event: React.MouseEvent<HTMLInputElement>) {
    setIsLoading(true)
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) {
      console.log("No file selected.")
      setIsLoading(false)
      return
    }

    mutate({
      file,
      userId,
    })
  }

  const isTouchDevice = useMediaQuery("(hover: none)")

  return (
    <ZStackGrid
      className="h-full aspect-square place-items-center"
      onContextMenu={(e) => {
        if (isTouchDevice) {
          e.preventDefault()
          setIsOpenDrawer(true)
        }
      }}
    >
      <input
        type="file"
        hidden
        accept="image/jpeg, image/png, image/webp"
        onChange={(event) => {
          handleImageUpload(event as any)
        }}
        onClick={handleImageUpload}
        ref={inputRef}
      />
      <Drawer open={isOpenDrawer} onOpenChange={setIsOpenDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Change Profile Picture</DrawerTitle>
            <DrawerDescription>Choose a new profile picture.</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-8">
            <Button
              className="w-full"
              size="lg"
              onClick={(e) => {
                e.preventDefault()
                if (!inputRef.current) return
                inputRef.current.click()
                setIsOpenDrawer(false)
              }}
            >
              <UploadIcon />
              Upload
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
      <Image
        src={imageSource}
        alt="Profile Picture"
        width={64}
        height={64}
        className="size-full aspect-square bg-accent animate-pulse object-cover rounded-full"
        onLoadStart={() => {}}
        onLoad={(event) => {
          const target = event.target as HTMLImageElement
          target.classList.remove("animate-pulse")
        }}
      />

      <ZStackGrid
        className={cn(
          "size-full rounded-full bg-accent/50 place-items-center",
          "opacity-0 hover:opacity-100 media-touch-hidden",
          m3ExpressiveDuration.effect.fast.className,
          m3ExpressiveDuration.effect.default.className,
        )}
      >
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={(e) => {
            e.preventDefault()
            if (!inputRef.current) return
            inputRef.current.click()
          }}
          type="button"
          disabled={isLoading}
        >
          <UploadIcon className="size-9" />
        </Button>
      </ZStackGrid>

      {isLoading && (
        <div className="grid place-items-center bg-accent/50 rounded-full size-full">
          <LoadingSpinner className="size-9" />
        </div>
      )}
    </ZStackGrid>
  )
}
export function ProfileImage(props: {
  profileURL: string | null
  userId: string
}) {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <Content {...props} />
    </QueryClientProvider>
  )
}
