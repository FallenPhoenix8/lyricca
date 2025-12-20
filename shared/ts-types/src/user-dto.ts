type User = {
  id: string
  username: string
  password: string
  created_at: Date
  updated_at: Date
}

type UserCreate = Omit<User, "id" | "created_at" | "updated_at">
type UserUpdate = Partial<UserCreate>
type UserDTO = Omit<User, "password">

export type { User, UserCreate, UserUpdate, UserDTO }
