"use server"

import { SongCreateSchema } from "@/lib/model/Song"
import { AvailableLanguages } from "@shared/ts-types"
import { ArkErrors } from "arktype"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

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

  const validatedFields = SongCreateSchema({
    title: formData.get("title"),
    artist: formData.get("artist") ?? null,
    album: formData.get("album") ?? null,
    original_lyrics: formData.get("original_lyrics"),
    translated_lyrics: formData.get("translated_lyrics"),
  })

  const state: SongState = {
    errors: {
      title: [],
      artist: [],
      album: [],
      originalLyrics: [],
      translatedLyrics: [],
      cover: [],
    },
    message: null,
  }

  if (validatedFields instanceof ArkErrors) {
    validatedFields.flat().map((error) => {
      console.log(error.message)
      if (error.message.toLowerCase().includes("title")) {
        state.errors?.title?.push(error.message)
      }

      if (error.message.toLowerCase().includes("artist")) {
        state.errors?.artist?.push(error.message)
      }

      if (error.message.toLowerCase().includes("album")) {
        state.errors?.album?.push(error.message)
      }

      if (error.message.toLowerCase().includes("original_lyrics")) {
        state.errors?.originalLyrics?.push(error.message)
      }

      if (error.message.toLowerCase().includes("translated_lyrics")) {
        state.errors?.translatedLyrics?.push(error.message)
      }
    })
    return state
  }

  // * MARK: - Verify if cover file is included with the submitted form

  const file = formData.get("cover") as File | null
  if (!file || file.size < 1) {
    state.errors?.cover?.push("Cover file is required.")
    return state
  }

  if (file) {
    const fileObj = file as File
    const fileName = fileObj.name
    const fileExtension = fileName.split(".").pop()

    if (
      fileExtension !== "jpg" &&
      fileExtension !== "jpeg" &&
      fileExtension !== "png" &&
      fileExtension !== "webp"
    ) {
      state.errors?.cover?.push(
        "Invalid file type. Only JPEG and JPG files are supported.",
      )
      return state
    }
  } else {
    state.errors?.cover?.push("Cover file is required.")
    return state
  }

  try {
    // * MARK: - Create new `FormData` and append all validated fields
    const dataToSend = new FormData()

    Object.entries(validatedFields).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        dataToSend.append(key, value as string)
      }
    })

    // * MARK: - Append file to `FormData`
    if (file && file instanceof File) {
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
      return { errors: {}, message: "Something went wrong." }
    }
  } catch (error) {
    console.error("Failed to add song:", error)
    return { errors: {}, message: "Something went wrong." }
  }

  // * MARK: - Redirect to library page if successful
  redirect("/app/library")
}
