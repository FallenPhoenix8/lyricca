import { CoverDTO } from "./cover-dto"
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
  cover_id: string | null
  cover: CoverDTO | null
}
/**
 * Song ID type
 */
type SongIDType = Song["id"]

type SongDTO = Omit<Song, "user_id" | "user" | "cover_id">

type SongCreateDTO = Omit<
  SongDTO,
  "id" | "created_at" | "updated_at" | "user" | "cover" | "cover_id"
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

type SongCheckAllInputItem = Pick<Song, "id" | "updated_at">
type SongCheckAllInput = {
  items: SongCheckAllInputItem[]
}

type SongCheckAllOutput = {
  toBeUpdated: SongIDType[]
  toBeCreated: SongIDType[]
  toBeDeleted: SongIDType[]
}

export type {
  SongDTO,
  SongCreateDTO,
  SongUpdateDTO,
  SongCheckOutput,
  Song,
  SongIDType,
  SongCheckAllOutput,
  SongCheckAllInputItem,
  SongCheckAllInput,
}
