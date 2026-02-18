import { useLiveQuery } from "dexie-react-hooks"
import { SongCheckAllInput, SongCheckAllOutput } from "@shared/ts-types"
import db from "../db"
import APIClient from "@/lib/data/APIClient"
import type {
  TypeSongCreate,
  TypeSongDTO,
  TypeSongUpdate,
} from "@/lib/model/Song"
import { useCallback } from "react"
import { Err, Ok, Result } from "@/types/Result"

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
): Promise<Result<TypeSongDTO, Error>> {
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
): Promise<Result<TypeSongDTO, Error>> {
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

async function remove(id: string): Promise<Result<TypeSongDTO, Error>> {
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
    songs,
    create,
    update,
    remove,
  }
}
