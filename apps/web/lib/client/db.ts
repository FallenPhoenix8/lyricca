import Dexie, { type EntityTable } from "dexie"
import type { SongDTO } from "@shared/ts-types/song-dto"

// We extend the DTO locally for indexing purposes
export interface InternalSongDTO extends SongDTO {
  search_artist?: string // Lowercased or "unknown artist"
  search_album?: string // Lowercased or "unknown album"
}

export type LyriccaDB = Dexie & {
  songs: EntityTable<InternalSongDTO, "id">
}

const db = new Dexie("lyricca-db") as LyriccaDB

db.version(2).stores({
  songs:
    "id, title, search_artist, search_album, [search_artist+search_album], updated_at",
})

// * MARK: - Hook for NEW songs
db.songs.hook("creating", (primKey, obj: InternalSongDTO) => {
  obj.search_artist = (obj.artist || "Unknown Artist").toLowerCase()
  obj.search_album = (obj.album || "Unknown Album").toLowerCase()
})

// * MARK: - Hook for UPDATED songs
db.songs.hook(
  "updating",
  (mods: Partial<InternalSongDTO>, primKey, obj: InternalSongDTO) => {
    return {
      ...mods,
      search_artist: (
        mods.artist ||
        obj.artist ||
        "Unknown Artist"
      ).toLowerCase(),
      search_album: (mods.album || obj.album || "Unknown Album").toLowerCase(),
    }
  },
)

export default db
