import type {
  SongDTO,
  SongCreateDTO,
  SongUpdateDTO,
} from "@shared/ts-types/song-dto"
import { CoverSchema } from "./Cover"
import { z } from "zod"

// Helper to handle standard non-empty strings
const nonEmptyString = z.string().min(1)

const SongSchema: z.ZodType<SongDTO> = z.object({
  id: z.uuid(),
  title: nonEmptyString,
  artist: nonEmptyString,
  album: nonEmptyString,
  original_lyrics: nonEmptyString,
  translated_lyrics: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  cover_id: z.uuid(),
  cover: CoverSchema, // Assumes CoverSchema is a Zod schema returning the correct Cover type
})

const SongCreateSchema = z.object({
  title: nonEmptyString,
  original_lyrics: nonEmptyString,
  translated_lyrics: z.string(),
  artist: z.string().nullable().optional(),
  album: z.string().nullable().optional(),
}) as z.ZodType<SongCreateDTO>

const SongUpdateSchema: z.ZodType<SongUpdateDTO> = z
  .object({
    title: nonEmptyString,
    original_lyrics: nonEmptyString,
    translated_lyrics: nonEmptyString,
    artist: z.string().nullable(),
    album: z.string().nullable(),
  })
  .partial()

export { SongSchema, SongCreateSchema, SongUpdateSchema }
