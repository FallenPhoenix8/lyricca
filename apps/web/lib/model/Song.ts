import type {
  SongDTO,
  SongCreateDTO,
  SongUpdateDTO,
} from "@shared/ts-types/song-dto"
import { CoverSchema } from "./Cover"
import { type } from "arktype"
import { title } from "process"

const SongSchema = type({
  id: "string.uuid",
  title: "string > 0",
  artist: "string > 0",
  album: "string > 0",
  original_lyrics: "string > 0",
  translated_lyrics: "string > 0",
  created_at: "Date",
  updated_at: "Date",
  cover_id: "string.uuid",
  cover: CoverSchema,
})

const SongCreateSchema = type({
  title: "string > 0",
  original_lyrics: "string > 0",
  translated_lyrics: "string > 0",
  "artist?": "string",
  "album?": "string",
})

const SongUpateSchema = type({
  title: "string > 0",
  original_lyrics: "string > 0",
  translated_lyrics: "string > 0",
  artist: "string > 0",
  album: "string > 0",
}).partial()

// export type { TypeSongDTO, TypeSongCreate }
export { SongSchema, SongCreateSchema, SongUpateSchema }
