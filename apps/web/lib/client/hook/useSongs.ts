import { useLiveQuery } from "dexie-react-hooks"
import {
  ErrorResponseDTO,
  SongCheckAllInput,
  SongCheckAllOutput,
  SongDTO,
  SongUpdateDTO,
} from "@shared/ts-types"
import db from "../db"
import APIClient from "@/lib/data/APIClient"
import type { TypeSongCreate, TypeSongDTO } from "@/lib/model/Song"
import { useCallback, useEffect, useRef, useState } from "react"
import { Err, Ok, Result } from "@/types/Result"
import { useMutation, useQuery, useQueryClient } from "react-query"

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
  input: SongUpdateDTO,
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
  console.log("Syncing local songs...")
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
  const countTotalToSync =
    upToDateSongs.toBeCreated.length +
    upToDateSongs.toBeUpdated.length +
    upToDateSongs.toBeDeleted.length

  console.log(
    countTotalToSync === 0
      ? "Songs are up to date."
      : `Syncing ${countTotalToSync} songs...`,
  )
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
  if (countTotalToSync > 0) {
    console.log("Syncing songs completed.")
  }
}

export function useSongs() {
  const [isLoading, setIsLoading] = useState(true)
  const songs = useLiveQuery(
    () => {
      const songs = db.songs.toArray()
      setIsLoading(false)
      return songs
    },
    [],
    [] as SongDTO[],
  )

  const count = useLiveQuery(() => db.songs.count(), [], null)

  // * MARK: - Keep latest songs without re-binding listeners
  const songsRef = useRef(songs)
  useEffect(() => {
    songsRef.current = songs
  }, [songs])

  // MARK: - Prevent overlapping sync calls
  const isSyncingRef = useRef(false)

  const syncNow = useCallback(async () => {
    if (isLoading) return
    if (isSyncingRef.current) return
    isSyncingRef.current = true

    if (!songsRef.current) {
      isSyncingRef.current = false
      return
    }

    const songCheckAllInput = {
      items: songsRef.current.map((song) => ({
        id: song.id,
        updated_at: song.updated_at,
      })),
    }

    try {
      await checkAndUpdateAllLocally(songCheckAllInput)
      isSyncingRef.current = false
    } finally {
      isSyncingRef.current = false
    }
  }, [songsRef])

  /**
   * Initialize by checking all songs in the API and updating local database accordingly. This ensures that the local database is always in sync with the API, even if there are changes made from other clients or the server itself.
   */
  useEffect(() => {
    syncNow()
  }, [syncNow, songs])

  // * MARK: - Sync songs when the user comes back to tab
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible") syncNow()
    }

    document.addEventListener("visibilitychange", handler)
    window.addEventListener("focus", handler)
    window.addEventListener("pageshow", handler) // helps with bfcache restore

    // optional: also when connection comes back
    window.addEventListener("online", handler)

    return () => {
      document.removeEventListener("visibilitychange", handler)
      window.removeEventListener("focus", handler)
      window.removeEventListener("pageshow", handler)
      window.removeEventListener("online", handler)
    }
  }, [syncNow, songs])

  // * MARK: - Mutations
  /**
   * Query client for managing queries and mutations
   */
  const createMutation = useMutation((input: TypeSongCreate) => create(input), {
    onSuccess: (res) => {
      if (!res.ok) return
    },
  })
  const updateMutation = useMutation(
    ({ id, input }: { id: string; input: SongUpdateDTO }) => update(id, input),
    {
      onSuccess: (res) => {
        if (!res.ok) return
      },
    },
  )
  const removeMutation = useMutation(({ id }: { id: string }) => remove(id), {
    onSuccess: (res) => {
      if (!res.ok) return
    },
  })

  return {
    /**
     * Provides the total number of songs in the local database.
     */
    count,
    /**
     * Provides a list of songs from the local database. This allows components to access and display the songs without needing to make API calls, improving performance and responsiveness. The local database is kept in sync with the API through the `checkAndUpdateAllLocally` function, ensuring that the data is always up-to-date.
     */
    songs,
    /**
     * This function creates a new song by sending a request to the API and then updates the local database with the new song. It returns a query that can be used to track the status of the creation process and handle any errors that may occur.
     * @param input Input for adding a song
     * @returns Query for added song
     */
    create: createMutation,

    /**
     * This function updates an existing song by sending a request to the API and then updates the local database with the updated song. It returns a query that can be used to track the status of the update process and handle any errors that may occur.
     * @param id The ID of the song to update
     * @param input Input for updating a song
     * @returns Query for updated song
     */
    update: updateMutation,

    /**
     * This function removes a song by sending a request to the API and then updates the local database with the deleted song. It returns a query that can be used to track the status of the removal process and handle any errors that may occur.
     * @param id The ID of the song to remove
     * @returns Query for deleted song
     */
    remove: removeMutation,

    /**
     * This function finds a song in the local database by its ID. It returns the song if found, or null otherwise.
     *
     * @param id The ID of the song to find
     * @returns song with the given ID, or null if not found
     */
    findOneLocally: (id: string): SongDTO | null => {
      return songs?.find((song) => song.id === id) ?? null
    },
    isLoading,
  }
}
