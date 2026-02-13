import Dexie, { type EntityTable } from "dexie"
import type { SongDTO } from "@shared/ts-types/song-dto"

export type LyriccaDB = Dexie & {
  songs: EntityTable<SongDTO, "id">
}

const db = new Dexie("lyricca-db") as LyriccaDB

db.version(1).stores({
  // pk + indexes
  songs: "id, title, artist, album, created_at, updated_at",
})

export default db
