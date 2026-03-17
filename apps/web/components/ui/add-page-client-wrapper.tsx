"use client"
import { Button } from "@/components/ui/button"
import { VStack, ZStackGrid } from "@/components/ui/layout"
import {
  startTransition,
  Suspense,
  useActionState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  ViewTransition,
} from "react"
import { UploadSimpleIcon, SparkleIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { easeOvershootClassName } from "@/components/ui/constants"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ErrorResponseDTO, TranslationOutputDTO } from "@shared/ts-types"
import { Err, Ok, Result } from "@/types/Result"
import APIClient from "@/lib/data/APIClient"
import { useMutation } from "react-query"
import { useQueryState } from "nuqs"
import { LyricsView } from "./lyrics-view"
import { useDebounce, useDebouncedCallback } from "use-debounce"
import { usePreventEnterKey } from "@/lib/client/hook/usePreventEnterKey"
import { SuggestionDTO } from "@shared/ts-types/cover-dto"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "./breadcrumb"
import { addSongAction, SongState } from "@/app/app/add/actions"

async function translateAction({
  text,
  from,
  to,
}: {
  text: string
  from: string | null
  to: string
}): Promise<Result<TranslationOutputDTO, ErrorResponseDTO>> {
  const result = await APIClient.shared.post<TranslationOutputDTO>(
    "/translate",
    {
      text,
      from,
      to,
    },
  )
  return result
}

async function getCoverSuggestionAction({
  artist,
  title,
}: {
  artist: string
  title: string
}): Promise<Result<SuggestionDTO, ErrorResponseDTO>> {
  const queryParts = [`artist=${artist}`, `title=${title}`]
  const query = queryParts.join("&")
  const result = await APIClient.shared.get<SuggestionDTO>(
    `/covers/suggestion?${query}`,
  )
  console.log(result)
  if (!result.ok) {
    console.error("Failed to get cover suggestion:", result.error)
    return Err(result.error)
  }

  return Ok(result.value)
}

async function convertURLToFile(url: string): Promise<File> {
  const response = await fetch(url)
  const blob = await response.blob()
  const extension = blob.type.split("/")[1]
  const fileName = `cover.${extension}`
  return new File([blob], fileName, { type: blob.type })
}

export function AddPageClientWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOverlayVisible, setIsOverlayVisible] = useState(true)
  const [isImageActionsVisible, setIsImageActionsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) {
      return
    }
    const temporaryFileURL = URL.createObjectURL(file)

    setCoverURL(temporaryFileURL)
    updateImageActionsVisibility(false)
    setCoverFileMutation.mutate()
  }
  function updateOverlayVisibility(newState: boolean) {
    startTransition(() => {
      setIsOverlayVisible(newState)
    })
  }

  function updateImageActionsVisibility(newState: boolean) {
    startTransition(() => {
      updateOverlayVisibility(newState)
      setIsImageActionsVisible(newState)
    })
  }

  function updateLoadingState(newState: boolean) {
    startTransition(() => {
      updateImageActionsVisibility(false)
      updateOverlayVisibility(newState)
      setIsLoading(newState)
    })
  }

  const [title, setTitle] = useQueryState("t", { defaultValue: "" })
  const [artist, setArtist] = useQueryState("art", { defaultValue: "" })
  const [album, setAlbum] = useQueryState("alb", { defaultValue: "" })
  const [originalLyrics, setOriginalLyrics] = useState("")
  const [translatedLyrics, setTranslatedLyrics] = useState("")
  const [errors, setErrors] = useState<{
    originalLyrics?: string[]
    translatedLyrics?: string[]
    targetLanguage?: string[]
    title?: string[]
    artist?: string[]
    album?: string[]
  }>({})
  const [sourceLanguage] = useQueryState("sl", { defaultValue: "auto" })
  const [targetLanguage] = useQueryState("tl")
  const translateMutation = useMutation(translateAction, {
    onSuccess: (response) => {
      if (!response.ok) {
        console.error("Failed to translate lyrics:", response.error)
        return
      }
      const translatedLyrics = response.value.translatedTextLines.join("\n")
      console.log("Translated lyrics:", translatedLyrics)
      setTranslatedLyrics(translatedLyrics)
    },
    onError: (error) => {
      console.error("Failed to translate lyrics:", error)
    },
  })

  const [coverURL, setCoverURL] = useState<string>("/empty.png")
  const getSuggestionMutation = useMutation(getCoverSuggestionAction, {
    onMutate: () => {
      updateImageActionsVisibility(false)
      updateLoadingState(true)
    },
    onSuccess: (response) => {
      updateLoadingState(false)
      if (!response.ok) {
        console.error("Failed to get cover suggestion:", response.error)
        return
      }
      console.log(response)
      const suggestion = response.value
      const suggestionURL = suggestion.url
        ? `/api/proxy?url=${suggestion.url}`
        : "/default.png"
      setCoverURL(suggestionURL)
      setCoverFileMutation.mutate()
    },
    onError: (error) => {
      updateLoadingState(false)
      console.error("Failed to get cover suggestion:", error)
    },
  })

  const setCoverFileMutation = useMutation(
    async () => {
      if (coverURL === "/default.png" || coverURL === "/empty.png") {
        console.log("Cover URL is empty or default, skipping...")
        return
      }
      const file = await convertURLToFile(coverURL)
      if (coverFileRef.current) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        coverFileRef.current.files = dataTransfer.files
      }
      console.log("Cover file set successfully.", coverFileRef.current?.files)
    },
    {
      onSuccess: () => {},
      onError: (error) => {
        console.error("Failed to set cover file:", error)
      },
    },
  )

  function handleTranslate() {
    startTransition(() => {
      const fromLanguage = sourceLanguage === "auto" ? null : sourceLanguage
      let isHasErrors = false
      if (!targetLanguage) {
        setErrors((prev) => ({
          ...prev,
          targetLanguage: ["Target language is required."],
        }))
        isHasErrors = true
      }
      if (originalLyrics.trim() === "") {
        setErrors((prev) => ({
          ...prev,
          originalLyrics: ["Original lyrics cannot be empty."],
        }))
        isHasErrors = true
      }

      if (isHasErrors) {
        return
      }

      setOriginalLyrics(originalLyrics.trim())
      setErrors({})
      translateMutation.mutate({
        text: originalLyrics.trim(),
        from: fromLanguage,
        to: targetLanguage!,
      })
    })
  }
  function handleLyricsChange({
    translatedLyrics,
    originalLyrics,
  }: {
    translatedLyrics: string
    originalLyrics: string
  }) {
    console.log("TEST", translatedLyrics)
    setTranslatedLyrics(translatedLyrics)
    setOriginalLyrics(originalLyrics)
  }

  const [isEditableLyrics, setIsEditableLyrics] = useState(false)

  const buttonFileInputRef = useRef<HTMLInputElement>(null)
  const coverFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    console.log("Lyrics changed:", { originalLyrics, translatedLyrics })
  }, [originalLyrics, translatedLyrics])

  useEffect(() => {
    if (translateMutation.isLoading) {
      translateMutation.reset()
      setIsEditableLyrics(false)
    }
  }, [isEditableLyrics, translateMutation])

  useLayoutEffect(() => {
    setCoverFileMutation.mutate()
  }, [coverURL])

  const initialState: SongState = {
    errors: {},
    message: null,
  }
  const [state, formAction, isPending] = useActionState(
    addSongAction,
    initialState,
  )
  useEffect(() => {
    setErrors(state.errors ?? {})
  }, [state])

  // const [isPending, startTransition] = useTransition()
  // function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
  //   event.preventDefault()
  //   const formData = new FormData(event.currentTarget)
  //   startTransition(() => {
  //     formAction(formData)
  //   })
  // }

  useEffect(() => {
    console.log("translatedLyrics changed:", translatedLyrics)
  }, [translatedLyrics])

  useEffect(() => {
    console.log(state)
  }, [state])
  return (
    <ViewTransition>
      <Breadcrumb className="my-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Add</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid grid-cols-12 grid-rows-[200px 200px] gap-4">
        <div className="col-span-12 md:col-span-4 row-span-1 md:h-screen flex flex-col md:sticky top-0">
          <div className="py-2 px-4">
            <FieldLabel>Cover</FieldLabel>
            <FieldDescription>
              Upload a cover image or get a suggestion from the internet.
              {state.errors?.cover && (
                <span className="text-destructive">
                  {state.errors.cover.map((error, index) => (
                    <span key={index}>
                      {error}
                      <br />
                    </span>
                  ))}
                </span>
              )}
            </FieldDescription>
          </div>
          <ViewTransition>
            <ZStackGrid
              className={cn(
                "group w-full aspect-video md:aspect-square rounded-xl border-2",
                isLoading && "animate-pulse",
                easeOvershootClassName,
              )}
              onMouseOver={() => updateImageActionsVisibility(true)}
              onContextMenu={(event) => {
                updateImageActionsVisibility(true)
              }}
            >
              <img
                src={coverURL}
                alt="Empty Cover"
                className="w-full aspect-video md:aspect-square object-cover rounded-xl"
              />
              <div
                className={cn(
                  "w-full h-full bg-accent/50 rounded-xl",
                  isOverlayVisible ? "block" : "hidden",
                )}
              ></div>
              <div
                className={cn(
                  "justify-center items-center w-full h-full gap-2",
                  easeOvershootClassName,
                  isImageActionsVisible ? "flex" : "hidden",
                )}
              >
                <HoverCard closeDelay={10} openDelay={50}>
                  <HoverCardTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon-lg"
                      onClick={(e) => {
                        buttonFileInputRef.current?.click()
                      }}
                    >
                      <UploadSimpleIcon className="h-full" />
                      <input
                        type="file"
                        hidden
                        ref={buttonFileInputRef}
                        name="cover"
                        accept="image/jpeg, image/png, image/webp"
                        onChange={(event) => {
                          handleFileUpload(event)
                        }}
                      />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <p>Upload cover</p>
                  </HoverCardContent>
                </HoverCard>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon-lg"
                      onClick={() => {
                        getSuggestionMutation.mutate({
                          artist,
                          title,
                        })
                      }}
                    >
                      <SparkleIcon className="h-full" />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <p>
                      Get automatic suggestion{" "}
                      <span className="text-muted-foreground">
                        (based on artist and title)
                      </span>
                    </p>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <div
                className={cn(
                  "justify-center items-center w-full h-full",
                  easeOvershootClassName,
                  isLoading ? "flex" : "hidden",
                )}
              >
                <LoadingSpinner className="bg-accent fill-accent-foreground h-1/4 w-1/4" />
              </div>
            </ZStackGrid>
          </ViewTransition>
        </div>
        <div className="col-span-12 md:col-span-8 row-span-2 md:col-start-5">
          <form
            className="pl-4 gap-4"
            aria-describedby="add-song-error"
            action={formAction}
            // onSubmit={handleSubmit}
          >
            <FieldGroup>
              <FieldSet>
                <FieldLegend>Song Details</FieldLegend>
                <FieldDescription>
                  Enter the details of the song you want to add.
                </FieldDescription>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="title">Title</FieldLabel>
                    <Input
                      placeholder="Song title"
                      required
                      className="max-w-lg"
                      id="title"
                      onChange={(event) => {
                        const target = event.target as HTMLInputElement
                        setTitle(target.value)
                      }}
                      value={title}
                      aria-describedby="title-error"
                      name="title"
                    />
                    {state.errors?.title && (
                      <p
                        className="text-destructive"
                        id="title-error"
                        aria-live="polite"
                      >
                        {state.errors?.title.map((error, index) => (
                          <span key={index}>
                            {error}
                            <br />
                          </span>
                        ))}
                      </p>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="artist">
                      Artist
                      <span className="text-muted-foreground">
                        (optional, required for cover suggestion)
                      </span>
                    </FieldLabel>
                    <Input
                      placeholder="Artist"
                      className="max-w-md"
                      id="artist"
                      onChange={(event) => {
                        const target = event.target as HTMLInputElement
                        setArtist(target.value)
                      }}
                      value={artist}
                      aria-describedby="artist-error"
                      name="artist"
                    />
                    {state.errors?.artist && (
                      <p
                        className="text-destructive"
                        id="artist-error"
                        aria-live="polite"
                      >
                        {state.errors?.artist.map((error, index) => (
                          <span key={index}>
                            {error}
                            <br />
                          </span>
                        ))}
                      </p>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="album">
                      Album
                      <span className="text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <Input
                      placeholder="Album"
                      className="max-w-md"
                      id="album"
                      onChange={(event) => {
                        const target = event.target as HTMLInputElement
                        setAlbum(target.value)
                      }}
                      value={album}
                      aria-describedby="album-error"
                      name="album"
                    />
                    {state.errors?.album && (
                      <p
                        className="text-destructive"
                        id="album-error"
                        aria-live="polite"
                      >
                        {state.errors?.album.map((error, index) => (
                          <span key={index}>
                            {error}
                            <br />
                          </span>
                        ))}
                      </p>
                    )}
                  </Field>
                </FieldGroup>
              </FieldSet>

              <FieldGroup className="mt-4">
                <Field>
                  <FieldLabel htmlFor="original_lyrics">
                    Original Lyrics
                  </FieldLabel>
                  <Textarea
                    id="original_lyrics"
                    placeholder="Original lyrics"
                    required
                    className="resize-none"
                    onChange={(event) => {
                      const target = event.target as HTMLTextAreaElement
                      setOriginalLyrics(target.value)
                    }}
                    value={originalLyrics}
                    aria-describedby="original-lyrics-error"
                    name="original_lyrics"
                  />
                  {errors.originalLyrics && (
                    <p
                      className="text-destructive"
                      id="original-lyrics-error"
                      aria-live="polite"
                    >
                      {errors.originalLyrics.map((error, index) => (
                        <span key={index}>
                          {error}
                          <br />
                        </span>
                      ))}
                    </p>
                  )}
                  <input
                    type="hidden"
                    name="translated_lyrics"
                    value={translatedLyrics}
                  />
                </Field>
                <Suspense
                  fallback={
                    <div className="grid place-items-center px-4 py-2">
                      <LoadingSpinner />
                    </div>
                  }
                >
                  {children}
                </Suspense>
                {errors.targetLanguage && (
                  <p className="text-destructive">
                    {errors.targetLanguage.map((error, index) => (
                      <span key={index}>
                        {error}
                        <br />
                      </span>
                    ))}
                  </p>
                )}
                <Field>
                  <Button
                    className="w-full"
                    disabled={translateMutation.isLoading}
                    onClick={handleTranslate}
                    type="button"
                  >
                    {translateMutation.isLoading && <LoadingSpinner />}
                    Translate
                  </Button>
                </Field>
              </FieldGroup>
              <LyricsView
                translatedLyrics={translatedLyrics.split("\n")}
                originalLyrics={originalLyrics.split("\n")}
                handleLyricsChange={handleLyricsChange}
                isReadyTranslation={!translateMutation.isLoading}
                isEditable={isEditableLyrics}
                setIsEditable={setIsEditableLyrics}
              />
            </FieldGroup>
            <input type="file" name="cover" hidden ref={coverFileRef} />
            <Button className="my-3 w-full" disabled={isPending}>
              {isPending && <LoadingSpinner />} Add Song
            </Button>
            {state.message && (
              <p
                className="text-destructive"
                id="add-song-error"
                aria-live="polite"
              >
                {state.message}
              </p>
            )}
          </form>
        </div>
      </div>
    </ViewTransition>
  )
}
