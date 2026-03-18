import { useLiveQuery } from "dexie-react-hooks"
import {
  ErrorResponseDTO,
  SongCheckAllInput,
  SongCheckAllOutput,
  SongCreateDTO,
  SongDTO,
  SongUpdateDTO,
} from "@shared/ts-types"
import db from "../db"
import APIClient from "@/lib/data/APIClient"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Err, Ok, Result } from "@/types/Result"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { useQueryState } from "nuqs"

async function getDetails(id: string): Promise<SongDTO | null> {
  const endpoint = `songs/${id}`
  const result = await APIClient.shared.get<SongDTO>(endpoint)
  if (!result.ok) {
    console.error(`Failed to get song details for id ${id}:`, result.error)
    return null
  }
  return result.value
}

async function create(
  input: SongCreateDTO,
): Promise<Result<SongDTO, ErrorResponseDTO>> {
  // * MARK: - Create song in the API
  const endpoint = "songs"
  const result = await APIClient.shared.post<SongDTO>(endpoint, input)
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
): Promise<Result<SongDTO, ErrorResponseDTO>> {
  // * MARK: - Update song in the API
  const endpoint = `songs/${id}`
  const result = await APIClient.shared.patch<SongDTO>(endpoint, input)
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

async function remove(id: string): Promise<Result<SongDTO, ErrorResponseDTO>> {
  // * MARK: - Remove song from the API
  const endpoint = `songs/${id}`
  const result = await APIClient.shared.delete<SongDTO>(endpoint, {})
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

async function checkAndUpdateAllLocally(
  input: SongCheckAllInput,
  isLoading: boolean,
) {
  console.log("Syncing local songs...")
  if (isLoading) {
    console.log("Skipping syncing local songs because loading is in progress.")
    return
  }
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

  const isUpToDate = countTotalToSync === 0
  console.log(
    isUpToDate
      ? "Songs are up to date."
      : `Syncing ${countTotalToSync} songs...`,
  )
  if (isUpToDate) {
    return
  }
  // * MARK: - Update songs in local database
  await db.transaction("rw", db.songs, async () => {
    for (const songId of upToDateSongs.toBeCreated) {
      try {
        const song = await getDetails(songId)
        if (song) {
          await db.songs.add(song, song.id)
        }
      } catch (error) {
        console.error("Failed to add song:", error)
      }
    }

    for (const songId of upToDateSongs.toBeUpdated) {
      try {
        const song = await getDetails(songId)
        if (song) {
          await db.songs.put(song, song.id)
        }
      } catch (error) {
        console.error("Failed to update song:", error)
      }
    }

    for (const songId of upToDateSongs.toBeDeleted) {
      try {
        await db.songs.delete(songId)
      } catch (error) {
        console.error("Failed to delete song:", error)
      }
    }
  })
  if (countTotalToSync > 0) {
    console.log("Syncing songs completed.")
  }
}

export function useSongs(
  searchQuery: string,
  filterTags: { type: "artist" | "album"; value: string }[],
) {
  const songs = useLiveQuery(
    async () => {
      let collection

      // * MARK: - Check for compound index [artist+album]
      const artistTag = filterTags.find((t) => t.type === "artist")?.value
      const albumTag = filterTags.find((t) => t.type === "album")?.value

      if (artistTag && albumTag) {
        collection = db.songs
          .where("[artist+album]")
          .equals([artistTag, albumTag])
      } else if (artistTag) {
        collection = db.songs.where("artist").equals(artistTag)
      } else if (albumTag) {
        collection = db.songs.where("album").equals(albumTag)
      } else {
        collection = db.songs.toCollection()
      }

      // * MARK: - Perform the "includes" check on the reduced set
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        collection = collection.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            (s.artist?.toLowerCase().includes(q) ?? false),
        )
      }

      return await collection.toArray()
    },
    [searchQuery, filterTags],
    null,
  )
  const isLoading = useMemo(() => songs === null, [songs])

  const [isForcedSync, setIsForcedSync] = useQueryState("sync", {
    defaultValue: "false",
  })

  const count = useLiveQuery(() => db.songs.count(), [], null)

  // * MARK: - Keep latest songs without re-binding listeners
  const songsRef = useRef(songs)
  useEffect(() => {
    songsRef.current = songs
  }, [songs])

  // * MARK: - Prevent overlapping sync calls
  const isSyncingRef = useRef(false)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not set")
  }

  const syncNow = useCallback(async () => {
    const statusURL = new URL("/status", apiUrl)
    try {
      const response = await fetch(statusURL, {
        headers: {
          "access-control-allow-origin": "",
        },
      })
      if (!response.ok) {
        console.error(
          "Failed to check server status. Retrying in 30 seconds...",
          response.status,
        )
        setTimeout(syncNow, 1000 * 30)
      }
    } catch (error) {
      console.error(
        "Failed to check server status. Retrying in 30 seconds...",
        error,
      )
      setTimeout(syncNow, 1000 * 30)
      return
    }
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
      await checkAndUpdateAllLocally(songCheckAllInput, isLoading)
      isSyncingRef.current = false
    } finally {
      isSyncingRef.current = false
    }
  }, [songsRef, isLoading])

  /**
   * Initialize by checking all songs in the API and updating local database accordingly. This ensures that the local database is always in sync with the API, even if there are changes made from other clients or the server itself.
   */
  useEffect(() => {
    syncNow()
    if (isForcedSync === "true") {
      syncNow()
      setIsForcedSync("false")
    }
  }, [syncNow, songs, isLoading])

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
  const createMutation = useMutation((input: SongCreateDTO) => create(input), {
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
    songs: songs ?? [],
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
    syncNow,
  }
}
