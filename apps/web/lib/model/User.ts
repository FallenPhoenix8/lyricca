import type { UserDTO, UserCreate, UserUpdate } from "@shared/ts-types/user-dto"
import { type } from "arktype"

const UserSchema = type({
  id: "string.uuid",
  username: "string > 0",
  created_at: "Date",
  updated_at: "Date",
})
const TUserDTO = UserSchema.infer satisfies UserDTO

const UserCreateSchema = type({
  username: "string > 0",
  /**
   * Rules:
   * - min 8 chars,
   * - at least 1 lowercase,
   * - 1 uppercase,
   * - 1 digit,
   * - 1 symbol
   * */
  password: "/^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).*$/",
})
const TUserCreate = UserCreateSchema.infer satisfies UserCreate

const UserUpateSchema = UserCreateSchema.partial()
const TUserUpdate = UserUpateSchema.infer satisfies UserUpdate

type TypeUserDTO = typeof TUserDTO
type TypeUserCreate = typeof TUserCreate
type TypeUserUpdate = typeof TUserUpdate

export type { TypeUserDTO, TypeUserCreate, TypeUserUpdate }
export { UserSchema, UserCreateSchema, UserUpateSchema }
