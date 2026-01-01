import { SongDTO } from "./song-dto"
type User = {
  id: string
  username: string
  password: string
  created_at: Date
  updated_at: Date
  songs: SongDTO[]
}

type UserCreate = Omit<User, "id" | "created_at" | "updated_at" | "songs">
type UserUpdate = Partial<UserCreate>
type UserDTO = Omit<User, "password" | "songs">

export type { User, UserCreate, UserUpdate, UserDTO }
