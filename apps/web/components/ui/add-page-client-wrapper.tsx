"use client"
import { Button } from "@/components/ui/button"
import { ZStackGrid } from "@/components/ui/layout"
import {
  startTransition,
  Suspense,
  useActionState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  ViewTransition,
} from "react"
import { cn } from "@/lib/utils"
import {
  m3ExpressiveDuration,
  m3ExpressiveSpring,
} from "@/components/ui/constants"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Field,
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
import { SuggestionDTO } from "@shared/ts-types/cover-dto"
import { addSongAction, SongState } from "@/app/app/add/actions"
import { FieldDescriptionWithErrors } from "./field-description-with-errors"
import { ClipboardCheckIcon, ClipboardIcon } from "lucide-react"
import { BlurOverlay } from "./blur-overlay"
import { useDynamicTheme } from "@/lib/client/hook/useDynamicTheme"
import { TileGroup } from "./tile-group"
import { useMediaQuery } from "@/lib/client/hook/useMediaQuery"
import { usePreventEnterKey } from "@/lib/client/hook/usePreventEnterKey"

/**
 * Responsible for translating the lyrics.
 * @param text The lyrics to translate.
 * @param from The source language.
 * @param to The target language.
 * @returns The translation result.
 */
async function translateAction({
  text,
  from,
  to,
}: {
  text: string
  from: string | null
  to: string
}): Promise<Result<TranslationOutputDTO, ErrorResponseDTO>> {
  // * MARK: - Check if parameters are valid
  if (!text.trim() || !to.trim()) {
    return Err({
      error: "Invalid input",
      message: ["Please enter a valid input."],
      statusCode: 400,
    })
  }
  // * MARK: - Translate the text
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

/**
 * Responsible for getting a suggestion for the cover art.
 * @param artist The artist name.
 * @param title The song title.
 * @returns The suggestion result.
 */
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
  if (!result.ok) {
    console.error("Failed to get cover suggestion:", result.error)
    return Err(result.error)
  }

  return Ok(result.value)
}

/**
 * Creates a `File` object from a given URL.
 * @param url URL to the file.
 * @returns a `File` object from the URL target.
 */
async function convertURLToFile(url: string): Promise<File> {
  const response = await fetch(url)
  const blob = await response.blob()
  const extension = blob.type.split("/")[1]
  const fileName = `cover.${extension}`
  return new File([blob], fileName, { type: blob.type })
}

/**
 * The main component for the add page. It handles the translation, cover suggestion, and file upload.
 */
export function AddPageClientWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOverlayVisible, setIsOverlayVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const { applyThemeFromImage } = useDynamicTheme()

  // * MARK: - Overlay State
  function updateOverlayVisibility(newState: boolean) {
    setIsOverlayVisible(newState)
  }

  function updateLoadingState(newState: boolean) {
    updateOverlayVisibility(newState)
    setIsLoading(newState)
  }

  // * MARK: - Song State
  const [title, setTitle] = useQueryState("t", { defaultValue: "" })
  const [artist, setArtist] = useQueryState("art", { defaultValue: "" })
  const [album, setAlbum] = useQueryState("alb", { defaultValue: "" })
  const [sourceLanguage] = useQueryState("sl", { defaultValue: "auto" })
  const [targetLanguage] = useQueryState("tl", {
    defaultValue: "en-US",
  })

  const [originalLyrics, setOriginalLyrics] = useState("")
  const [translatedLyrics, setTranslatedLyrics] = useState("")
  const [isEditableLyrics, setIsEditableLyrics] = useState(false)
  const [isPasted, setIsPasted] = useState(false)

  const [isTranslatedWithGoogleTranslate, setIsTranslatedWithGoogleTranslate] =
    useState(false)
  const [errors, setErrors] = useState<{
    originalLyrics?: string[]
    translatedLyrics?: string[]
    targetLanguage?: string[]
    title?: string[]
    artist?: string[]
    album?: string[]
  }>({})
  const lyricsViewRef = useRef<HTMLDivElement>(null)

  function handleDeletePair(index: number) {
    const newOriginalLyrics: string = originalLyrics
      .split("\n")
      .filter((_, i) => i !== index)
      .join("\n")
    setOriginalLyrics(newOriginalLyrics)
    const newTranslatedLyrics: string = translatedLyrics
      .split("\n")
      .filter((_, i) => i !== index)
      .join("\n")
    setTranslatedLyrics(newTranslatedLyrics)
  }

  function handleAddPair() {
    const newOriginalLyrics: string = originalLyrics
      .split("\n")
      .concat("")
      .join("\n")
    setOriginalLyrics(newOriginalLyrics)
    const newTranslatedLyrics: string = translatedLyrics
      .split("\n")
      .concat("")
      .join("\n")
    setTranslatedLyrics(newTranslatedLyrics)
  }

  function pasteOriginalLyrics() {
    const text = navigator.clipboard.readText()
    text.then((content) => {
      setOriginalLyrics(content)
      setIsPasted(true)
    })
  }

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
    setTranslatedLyrics(translatedLyrics)
    setOriginalLyrics(originalLyrics)
  }

  const translateMutation = useMutation(translateAction, {
    onSuccess: (response) => {
      if (!response.ok) {
        console.error("Failed to translate lyrics:", response.error)
        return
      }
      const translatedLyrics = response.value.translatedTextLines
        .map((l) => (l.endsWith("\n") ? l : l + "\n"))
        .join("")
      console.log("Translated lyrics:", translatedLyrics)
      startTransition(() => {
        setTranslatedLyrics(translatedLyrics.trim())
        setIsTranslatedWithGoogleTranslate(
          response.value.withGoogleTranslate || false,
        )
      })
      originalLyrics.split("\n").map((l, index) => {
        console.log({
          original: l,
          translated: translatedLyrics.split("\n")[index],
        })
      })
    },
    onError: (error) => {
      console.error("Failed to translate lyrics:", error)
    },
  })

  // * MARK: - Cover Art State
  const coverImageRef = useRef<HTMLImageElement>(null)
  const coverFileRef = useRef<HTMLInputElement>(null)
  const buttonFileInputRef = useRef<HTMLInputElement>(null)

  const [coverURL, setCoverURL] = useState<string>("default")
  const [isCoverUploading, setIsCoverUploading] = useState(false)
  const [isCoverSuggesting, setIsCoverSuggesting] = useState(false)

  const isCoverDefault = coverURL === "default" || isLoading
  const displayCoverURL = useMemo((): string => {
    if (coverURL === "default") {
      return "/cover-default.svg"
    } else if (coverURL === "empty") {
      return "/empty.png"
    } else {
      return coverURL
    }
  }, [coverURL])

  async function handleFileUpload(event: React.MouseEvent<HTMLInputElement>) {
    setIsCoverUploading(true)
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) {
      updateLoadingState(false)
      setIsCoverUploading(false)
      return
    }
    const temporaryFileURL = URL.createObjectURL(file)

    setCoverURL(temporaryFileURL)
    await setCoverFile()
    console.log("Loading ended")
  }

  const getSuggestionMutation = useMutation(getCoverSuggestionAction, {
    onMutate: () => {
      updateLoadingState(true)
      setIsCoverSuggesting(true)
    },
    onSuccess: (response) => {
      if (!response.ok) {
        console.error("Failed to get cover suggestion: ", response.error)
        updateLoadingState(false)
        setIsCoverSuggesting(false)
        return
      }
      console.log(response)
      const suggestion = response.value
      const suggestionURL = suggestion.url
        ? `/api/proxy?url=${suggestion.url}`
        : "/default.png"
      setCoverURL(suggestionURL)
      setCoverFileMutation.mutate()

      setIsCoverSuggesting(false)
    },
    onError: (error) => {
      setIsCoverSuggesting(false)
      updateLoadingState(false)
      console.error("Failed to get cover suggestion:", error)
    },
  })
  const uploadCoverMutation = useMutation(handleFileUpload, {
    onMutate: () => {
      updateLoadingState(true)
      setIsCoverUploading(true)
    },
    onSuccess: () => {
      setIsCoverUploading(false)
    },
    onError: (error) => {
      setIsCoverUploading(false)
      console.error("Failed to upload cover:", error)
    },
  })
  async function setCoverFile() {
    if (coverURL === "default" || coverURL === "empty") {
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
  }

  const setCoverFileMutation = useMutation(setCoverFile, {
    onMutate: () => {
      updateLoadingState(true)
    },
    onSuccess: () => {
      setIsCoverSuggesting(false)
      setIsCoverUploading(false)
      updateLoadingState(false)
    },
    onError: (error) => {
      setIsCoverSuggesting(false)
      setIsCoverUploading(false)
      updateLoadingState(false)
      console.error("Failed to set cover file:", error)
    },
  })

  // * MARK: - Form State
  const initialState: SongState = {
    errors: {},
    message: null,
  }
  const [state, formAction, isPending] = useActionState(
    addSongAction,
    initialState,
  )

  // * MARK: - Effects
  const isCompact = useMediaQuery("(max-width: 520px)")

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

  useEffect(() => {
    setErrors(state.errors ?? {})
  }, [state])

  useEffect(() => {
    console.log("translatedLyrics changed:", translatedLyrics)
  }, [translatedLyrics])

  useLayoutEffect(() => {
    if (!coverImageRef.current) return
    if (displayCoverURL === "/empty.png") return
    if (isLoading) return
    console.log(coverImageRef.current)
    applyThemeFromImage(coverImageRef.current)
  }, [displayCoverURL, coverImageRef, isLoading])

  usePreventEnterKey(lyricsViewRef, () => setIsEditableLyrics(false), [
    isEditableLyrics,
  ])
  return (
    <ViewTransition enter="replace" exit="replace">
      {/*// * MARK: - Overlays */}
      <BlurOverlay />
      <div
        className="fixed inset-0 -z-30 bg-cover bg-center"
        style={{
          backgroundImage: `url("${displayCoverURL}")`,
        }}
      ></div>
      <ViewTransition name="add-page-content">
        <div className="grid grid-cols-12 grid-rows-[300px 1fr]">
          {/*// * MARK: - Cover Art */}
          <div className="col-span-12 md:col-span-4 row-span-2 md:h-screen flex flex-col md:sticky top-0">
            <ViewTransition name="add-cover-image">
              <ZStackGrid
                className={cn(
                  "group w-full absolute top-0 aspect-square rounded-b-xl rounded-t-none md:rounded-t-xl md:border-2 z-5",
                  isLoading && "animate-pulse",
                  m3ExpressiveDuration.effect.fast.className,
                  m3ExpressiveSpring.effect.fast.className,
                  !!state.errors?.cover && "border-destructive",
                )}
              >
                <img
                  src={displayCoverURL}
                  className="w-full aspect-square object-cover rounded-b-xl rounded-t-none md:rounded-t-xl"
                  aria-describedby="cover-description"
                  onLoad={() => {
                    updateLoadingState(false)
                  }}
                  ref={coverImageRef}
                />

                <div
                  className={cn(
                    "w-full h-full bg-accent/50 rounded-b-xl rounded-t-none md:rounded-t-xl md:border-2",
                    isOverlayVisible ? "block" : "hidden",
                  )}
                ></div>
                <div
                  className={cn(
                    "justify-center items-center w-full h-full",
                    m3ExpressiveDuration.effect.fast.className,
                    m3ExpressiveSpring.effect.fast.className,
                    isLoading ? "flex" : "hidden",
                  )}
                >
                  <LoadingSpinner className="bg-accent fill-accent-foreground h-1/4 w-1/4" />
                </div>
              </ZStackGrid>
            </ViewTransition>
          </div>
          {/*// * MARK: - Form Fields */}
          <div className="bg-background/30 backdrop-blur-2xl col-span-12 md:col-span-8 z-10 mt-[40vw] md:mt-10 row-span-1 rounded-t-2xl">
            <div className="py-2 px-1 md:px-4">
              <h1 className="text-2xl font-extrabold py-4 font-heading">
                Add a new song
              </h1>
              <TileGroup
                tiles={[
                  {
                    icon: "upload",
                    isActive: isCoverUploading,
                    setIsActive: setIsCoverUploading,
                    onClick: () => {
                      setIsCoverUploading(true)
                      buttonFileInputRef.current?.click()
                    },
                    isCompact,
                    children: "Upload Cover",
                    attributes: {
                      disabled: isCoverUploading,
                      className: cn(
                        isLoading &&
                          "opacity-70 cursor-not-allowed animate-pulse",
                      ),
                    },
                  },
                  {
                    icon: "sparkles",
                    isActive: isCoverSuggesting,
                    setIsActive: setIsCoverSuggesting,
                    onClick: () => {
                      getSuggestionMutation.mutate({
                        artist,
                        title,
                      })
                    },
                    isCompact: false,
                    children: "Cover Suggestion",
                    subtitle: <>(based on artist and title)</>,
                    attributes: {
                      disabled: isCoverSuggesting,
                      className: cn(
                        isLoading &&
                          "opacity-70 cursor-not-allowed animate-pulse",
                      ),
                    },
                  },
                ]}
              />
              <input
                type="file"
                hidden
                ref={buttonFileInputRef}
                name="cover"
                accept="image/jpeg, image/png, image/webp"
                onClick={(event) => {
                  uploadCoverMutation.mutate(event)
                }}
                onChange={(event) => {
                  uploadCoverMutation.mutate(event as any)
                }}
              />
              <FieldDescriptionWithErrors
                errors={state.errors?.cover ?? []}
                id="cover-description"
                className="pt-2"
              >
                Upload a cover image or get a suggestion from the internet. You
                can also edit translations line-by-line.
              </FieldDescriptionWithErrors>
            </div>
            <div className="row-span-2 md:col-start-5 z-10 ">
              <form className="px-2 md:px-4 gap-4 py-2" action={formAction}>
                <FieldGroup>
                  <FieldSet>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="title">Title</FieldLabel>
                        <FieldDescriptionWithErrors
                          errors={state.errors?.title ?? []}
                          id="title-description"
                        >
                          Enter the song title.
                        </FieldDescriptionWithErrors>
                        <Input
                          placeholder="Song title"
                          required
                          className={cn(
                            "max-w-lg",
                            !!state.errors?.title && "border-destructive",
                          )}
                          id="title"
                          onChange={(event) => {
                            const target = event.target as HTMLInputElement
                            setTitle(target.value)
                          }}
                          value={title}
                          aria-describedby="title-description"
                          name="title"
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="artist">
                          Artist
                          <span className="text-muted-foreground">
                            (optional, required for cover suggestion)
                          </span>
                        </FieldLabel>
                        <FieldDescriptionWithErrors
                          errors={state.errors?.artist ?? []}
                          id="artist-description"
                        >
                          Enter the artist name.
                        </FieldDescriptionWithErrors>
                        <Input
                          placeholder="Artist"
                          className={cn(
                            "max-w-md",
                            !!state.errors?.artist && "border-destructive",
                          )}
                          id="artist"
                          onChange={(event) => {
                            const target = event.target as HTMLInputElement
                            setArtist(target.value)
                          }}
                          value={artist}
                          aria-describedby="artist-description"
                          name="artist"
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="album">
                          Album
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FieldLabel>
                        <FieldDescriptionWithErrors
                          errors={state.errors?.album ?? []}
                          id="album-description"
                        >
                          Enter the album name.
                        </FieldDescriptionWithErrors>
                        <Input
                          placeholder="Album"
                          className={cn(
                            "max-w-md",
                            !!state.errors?.album && "border-destructive",
                          )}
                          id="album"
                          onChange={(event) => {
                            const target = event.target as HTMLInputElement
                            setAlbum(target.value)
                          }}
                          value={album}
                          aria-describedby="album-description"
                          name="album"
                        />
                      </Field>
                    </FieldGroup>
                  </FieldSet>

                  <FieldGroup className="mt-4">
                    <Field>
                      <FieldLabel htmlFor="original_lyrics">
                        Original Lyrics
                        <Button
                          variant="ghost"
                          onClick={pasteOriginalLyrics}
                          type="button"
                        >
                          {isPasted ? (
                            <ClipboardCheckIcon />
                          ) : (
                            <ClipboardIcon />
                          )}
                        </Button>
                      </FieldLabel>
                      <FieldDescriptionWithErrors
                        errors={state.errors?.originalLyrics ?? []}
                        id="original-lyrics-description"
                      >
                        Paste the original lyrics here.
                      </FieldDescriptionWithErrors>
                      <Textarea
                        id="original_lyrics"
                        placeholder="Original lyrics"
                        required
                        className={cn(
                          "resize-none",
                          state.errors?.originalLyrics && "border-destructive",
                        )}
                        onChange={(event) => {
                          const target = event.target as HTMLTextAreaElement
                          setOriginalLyrics(target.value)
                        }}
                        value={originalLyrics}
                        aria-describedby="original-lyrics-description"
                        name="original_lyrics"
                      />

                      <input
                        type="hidden"
                        name="translated_lyrics"
                        value={translatedLyrics}
                      />
                    </Field>

                    <FieldDescriptionWithErrors
                      errors={[
                        ...(errors.targetLanguage ?? []),
                        ...(errors.translatedLyrics ?? []),
                      ]}
                      id="translation-description"
                    >
                      <FieldLegend className="text-foreground">
                        Translation
                      </FieldLegend>
                      Select the target language for translation. You can also
                      edit translations line-by-line.
                      <br />
                      <span className="text-muted-foreground text-xs">
                        (Powered by{" "}
                        <a
                          href="https://www.deepl.com/en/translator"
                          target="_blank"
                          className="underline underline-offset-2"
                        >
                          DeepL
                        </a>{" "}
                        &{" "}
                        <a
                          href="https://translate.google.com/"
                          target="_blank"
                          className="underline underline-offset-2"
                        >
                          Google Translate
                        </a>
                        )
                      </span>
                    </FieldDescriptionWithErrors>
                    <Suspense
                      fallback={
                        <div className="grid place-items-center px-4 py-2">
                          <LoadingSpinner />
                        </div>
                      }
                    >
                      {children}
                    </Suspense>
                    <Field>
                      <Button
                        className="w-full"
                        disabled={translateMutation.isLoading}
                        onClick={handleTranslate}
                        type="button"
                        size="lg"
                      >
                        {translateMutation.isLoading && <LoadingSpinner />}
                        Translate
                      </Button>
                    </Field>
                    {isTranslatedWithGoogleTranslate && (
                      <p className="text-sm bg-[linear-gradient(90deg,#4285F4_0%,#EA4335_30%,#FBBC04_55%,#34A853_75%,#4285F4_100%)] bg-clip-text text-transparent font-semibold">
                        Translated with Google Translate.
                      </p>
                    )}
                  </FieldGroup>
                  <LyricsView
                    translatedLyrics={translatedLyrics.split("\n")}
                    originalLyrics={originalLyrics.split("\n")}
                    handleLyricsChange={handleLyricsChange}
                    isReadyTranslation={!translateMutation.isLoading}
                    isEditable={isEditableLyrics}
                    setIsEditable={setIsEditableLyrics}
                    aria-describedby="translation-description"
                    handleDeletePair={handleDeletePair}
                    canShowRomanization={false}
                    handleAddPair={handleAddPair}
                    ref={lyricsViewRef}
                  />
                </FieldGroup>
                <input type="file" name="cover" hidden ref={coverFileRef} />
                <input
                  type="hidden"
                  name="default-cover"
                  value={isCoverDefault ? "default" : ""}
                />
                <Button className="my-3 w-full" disabled={isPending} size="lg">
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
        </div>
      </ViewTransition>
    </ViewTransition>
  )
}
