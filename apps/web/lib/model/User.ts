import type { UserDTO, UserCreate, UserUpdate } from "@shared/ts-types/user-dto"
import { z } from "zod"

const nonEmptyString = z.string().min(1)

const PASSWORD_REGEX =
  /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).*$/

const PasswordSchema = z.string().regex(PASSWORD_REGEX, {
  message:
    "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character.",
})

const UsernameSchema = z.string().min(1).max(15, {
  message:
    "Username cannot be empty. Must be between 1 and 15 characters long.",
})

// Plain Zod objects for derivation
const BaseUserCreateSchema = z.object({
  username: UsernameSchema,
  password: PasswordSchema,
  email: z.email({
    message: "Please enter a valid email address",
  }),
})

const BaseUserUpdateSchema = BaseUserCreateSchema.partial()

const UserSchema = z.object({
  id: z.string().uuid({ message: "Invalid ID format" }),
  username: UsernameSchema,
  email: z.email({ message: "Invalid email address" }),
  created_at: z.date(),
  updated_at: z.date(),
  profile_url: z.string().url({ message: "Invalid URL format" }),
}) as z.ZodType<UserDTO>

const UserCreateSchema = BaseUserCreateSchema as z.ZodType<UserCreate>
const UserUpdateSchema = BaseUserUpdateSchema as z.ZodType<UserUpdate>

type TypeUserCreate = z.infer<typeof BaseUserCreateSchema>
type TypeUserUpdate = z.infer<typeof BaseUserUpdateSchema>

export type { TypeUserCreate, TypeUserUpdate }
export { UserSchema, UserCreateSchema, UserUpdateSchema }
