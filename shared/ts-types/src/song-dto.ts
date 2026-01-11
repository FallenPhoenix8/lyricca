import { UserDTO } from "./user-dto"

type Song = {
  id: string
  title: string
  artist: string | null
  album: string | null
  original_lyrics: string
  translated_lyrics: string
  created_at: Date
  updated_at: Date
  user_id: string
  user: UserDTO
}

type SongDTO = Omit<Song, "user" | "user_id">

type SongCreateDTO = Omit<
  SongDTO,
  "id" | "created_at" | "updated_at" | "user_id" | "user"
>
type SongUpdateDTO = Partial<SongCreateDTO>

// Schemas for checking if the data is up to date
type SongCheckOutput =
  | {
      isUpToDate: true
      data: null
    }
  | {
      isUpToDate: false
      data: SongDTO
    }

export type { SongDTO, SongCreateDTO, SongUpdateDTO, SongCheckOutput, Song }
