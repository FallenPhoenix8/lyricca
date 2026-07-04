"use server"

import { SongCreateSchema } from "@/lib/model/Song"
import { AvailableLanguages } from "@shared/ts-types"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

const apiURL = process.env.NEXT_PUBLIC_API_URL
if (!apiURL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set")
}

export type SongState = {
  errors?: {
    title?: string[]
    artist?: string[]
    album?: string[]
    originalLyrics?: string[]
    translatedLyrics?: string[]
    cover?: string[]
  }
  message?: string | null
}

export type TranslationState = {
  errors?: {
    text?: string[]
    from?: string[]
    to?: string[]
  }
  message?: string | null
}

/**
 * This function fetches the available languages from the API.
 * @returns Languages available for translation.
 */
export async function fetchLanguages(): Promise<AvailableLanguages> {
  const token = (await cookies()).get("token")?.value ?? ""
  const endpoint = "translate/languages"
  const url = new URL(endpoint, apiURL)
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    return { sourceLanguages: [], targetLanguages: [] }
  }
  const data = (await response.json()) as AvailableLanguages

  return data
}

/**
 * This action is used to add a new song to the database.
 * It's a server-side action that interacts with the API to create a new song.
 */
export async function addSongAction(prevState: SongState, formData: FormData) {
  // * MARK: - Extract fields from form and validate them
  let validatedData: {
    title: string
    original_lyrics: string
    translated_lyrics: string
    artist?: string | null
    album?: string | null
  }
  let file: File | null = null
  let isDefaultCover = false

  try {
    // Use safeParse to prevent errors from crashing the block
    const result = SongCreateSchema.safeParse({
      title: formData.get("title"),
      artist: formData.get("artist") || null,
      album: formData.get("album") || null,
      original_lyrics: formData.get("original_lyrics"),
      translated_lyrics: formData.get("translated_lyrics"),
    })

    if (!result.success) {
      const flatErrors = z.flattenError(result.error)

      return {
        errors: {
          title: flatErrors.fieldErrors.title || [],
          artist: flatErrors.fieldErrors.artist || [],
          album: flatErrors.fieldErrors.album || [],
          originalLyrics: flatErrors.fieldErrors.original_lyrics || [],
          translatedLyrics: flatErrors.fieldErrors.translated_lyrics || [],
          cover: [],
        },
        message: "Validation failed.",
      }
    }

    // Assign the successfully parsed data
    validatedData = result.data

    // * MARK: - Verify if cover file is included with the submitted form
    file = formData.get("cover") as File | null
    isDefaultCover = formData.get("default-cover") === "default"

    if (!file || file.size < 1) {
      isDefaultCover = true
    }

    if (file && file.size > 0) {
      const fileName = file.name
      const fileExtension = fileName.split(".").pop()?.toLowerCase()

      if (
        fileExtension !== "jpg" &&
        fileExtension !== "jpeg" &&
        fileExtension !== "png" &&
        fileExtension !== "webp"
      ) {
        return {
          errors: {
            title: [],
            artist: [],
            album: [],
            originalLyrics: [],
            translatedLyrics: [],
            cover: [
              "Invalid file type. Only JPEG, JPG, PNG, and WEBP files are supported.",
            ],
          },
          message: null,
        }
      }
    }
  } catch (error) {
    console.error("Failed to add song handling form:", error)
    return { errors: {}, message: "Something went wrong. Please try again." }
  }

  try {
    // * MARK: - Create new `FormData` and append all validated fields
    const dataToSend = new FormData()

    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        dataToSend.append(key, value)
      }
    })

    // * MARK: - Append file to `FormData`
    const isFileValid = file && file instanceof File
    if (file && isFileValid && !isDefaultCover) {
      dataToSend.append("cover", file)
    }

    // * MARK: - Make request to authenticated request to the API
    const token = (await cookies()).get("token")?.value ?? ""
    const response = await fetch(new URL("/songs", apiURL), {
      method: "POST",
      body: dataToSend, // Fetch automatically sets the correct boundary & Content-Type
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Backend Error:", errorData)
      return { errors: {}, message: "Something went wrong. Please try again." }
    }
  } catch (error) {
    console.error("Failed to add song:", error)
    return { errors: {}, message: "Something went wrong. Please try again." }
  }

  // * MARK: - Redirect to library page if successful
  redirect("/app/library")
}
