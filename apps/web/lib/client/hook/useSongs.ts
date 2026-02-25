import { useLiveQuery } from "dexie-react-hooks"
import {
  ErrorResponseDTO,
  SongCheckAllInput,
  SongCheckAllOutput,
} from "@shared/ts-types"
import db from "../db"
import APIClient from "@/lib/data/APIClient"
import type {
  TypeSongCreate,
  TypeSongDTO,
  TypeSongUpdate,
} from "@/lib/model/Song"
import { useCallback } from "react"
import { Err, Ok, Result } from "@/types/Result"
import { useQuery } from "react-query"
import { ApiError } from "next/dist/server/api-utils"

async function getDetails(id: string): Promise<TypeSongDTO | null> {
  const endpoint = `songs/${id}`
  const result = await APIClient.shared.get<TypeSongDTO>(endpoint)
  if (!result.ok) {
    console.error(`Failed to get song details for id ${id}:`, result.error)
    return null
  }
  return result.value
}

async function create(
  input: TypeSongCreate,
): Promise<Result<TypeSongDTO, ErrorResponseDTO>> {
  // * MARK: - Create song in the API
  const endpoint = "songs"
  const result = await APIClient.shared.post<TypeSongDTO>(endpoint, input)
  if (!result.ok) {
    console.error("Failed to create song:", result.error)
    return Err(result.error)
  }

  // * MARK: - Update local database
  const song = result.value
  await db.transaction("rw", db.songs, async () => {
    await db.songs.add(song)
  })
  return Ok(song)
}

async function update(
  id: string,
  input: TypeSongUpdate,
): Promise<Result<TypeSongDTO, ErrorResponseDTO>> {
  // * MARK: - Update song in the API
  const endpoint = `songs/${id}`
  const result = await APIClient.shared.patch<TypeSongDTO>(endpoint, input)
  if (!result.ok) {
    console.error("Failed to update song:", result.error)
    return Err(result.error)
  }
  // * MARK: - Update local database
  const song = result.value
  await db.transaction("rw", db.songs, async () => {
    await db.songs.put(song)
  })

  return Ok(song)
}

async function remove(
  id: string,
): Promise<Result<TypeSongDTO, ErrorResponseDTO>> {
  // * MARK: - Remove song from the API
  const endpoint = `songs/${id}`
  const result = await APIClient.shared.delete<TypeSongDTO>(endpoint)
  if (!result.ok) {
    console.error("Failed to remove song:", result.error)
    return Err(result.error)
  }
  // * MARK: - Update local database
  await db.transaction("rw", db.songs, async () => {
    await db.songs.delete(id)
  })
  return Ok(result.value)
}

async function checkAndUpdateAllLocally(input: SongCheckAllInput) {
  // * Check all songs in the API
  const endpoint = "songs/check-all"
  const result = await APIClient.shared.post<SongCheckAllOutput>(
    endpoint,
    input,
  )

  if (!result.ok) {
    console.error("Failed to check local songs:", result.error)
    return
  }

  const upToDateSongs = result.value
  // * Update songs in local database
  await db.transaction("rw", db.songs, async () => {
    for (const songId of upToDateSongs.toBeCreated) {
      const song = await getDetails(songId)
      if (song) {
        await db.songs.add(song)
      }
    }

    for (const songId of upToDateSongs.toBeUpdated) {
      const song = await getDetails(songId)
      if (song) {
        await db.songs.put(song)
      }
    }

    for (const songId of upToDateSongs.toBeDeleted) {
      await db.songs.delete(songId)
    }
  })
}

export default function useSongs() {
  const songs =
    useLiveQuery(() => {
      return db.songs.toArray()
    }) ?? []

  const songsCheckAllInput = useCallback(() => {
    return {
      items: songs.map((song) => ({
        id: song.id,
        updated_at: song.updated_at,
      })),
    }
  }, [songs])
  /**
   * Initialize by checking all songs in the API and updating local database accordingly. This ensures that the local database is always in sync with the API, even if there are changes made from other clients or the server itself.
   */
  checkAndUpdateAllLocally(songsCheckAllInput())

  return {
    /**
     * Provides a list of songs from the local database. This allows components to access and display the songs without needing to make API calls, improving performance and responsiveness. The local database is kept in sync with the API through the `checkAndUpdateAllLocally` function, ensuring that the data is always up-to-date.
     */
    songs,
    /**
     * This function creates a new song by sending a request to the API and then updates the local database with the new song. It returns a query that can be used to track the status of the creation process and handle any errors that may occur.
     * @param input Input for adding a song
     * @returns Query for added song
     */
    create: (input: TypeSongCreate) => {
      return useQuery(["create", input], () => create(input))
    },

    /**
     * This function updates an existing song by sending a request to the API and then updates the local database with the updated song. It returns a query that can be used to track the status of the update process and handle any errors that may occur.
     * @param id The ID of the song to update
     * @param input Input for updating a song
     * @returns Query for updated song
     */
    update: (id: string, input: TypeSongUpdate) => {
      return useQuery(["update", id, input], () => update(id, input))
    },

    /**
     * This function removes a song by sending a request to the API and then updates the local database with the deleted song. It returns a query that can be used to track the status of the removal process and handle any errors that may occur.
     * @param id The ID of the song to remove
     * @returns Query for deleted song
     */
    remove: (id: string) => {
      return useQuery(["remove", id], () => remove(id))
    },
  }
}
