import { SongDTO } from "./song-dto"
type User = {
  id: string
  username: string
  email: string
  password: string
  created_at: Date
  updated_at: Date
  songs: SongDTO[]
  profile_url: string | null

  reset_password_token?: string | null
  reset_password_expires_at?: Date | null
}

type UserCreate = Omit<
  User,
  "id" | "created_at" | "updated_at" | "songs" | "profile_url"
>
type UserUpdate = Partial<UserCreate>
type UserDTO = Omit<User, "password" | "songs">

type AvailabilityCheckDTO =
  | {
      username: string
      available: boolean
    }
  | {
      email: string
      available: boolean
    }

export type { User, UserCreate, UserUpdate, UserDTO, AvailabilityCheckDTO }
