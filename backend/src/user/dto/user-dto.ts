import type { UserCreate, UserUpdate, UserDTO, User } from "@shared/ts-types"
import { IsNotEmpty, IsStrongPassword, IsString } from "class-validator"

class UserCreateImpl implements UserCreate {
  @IsNotEmpty()
  @IsString()
  username: string

  @IsNotEmpty()
  @IsStrongPassword()
  password: string
}

class UserUpdateImpl implements UserUpdate {
  @IsNotEmpty()
  @IsString()
  username: string

  @IsNotEmpty()
  @IsStrongPassword()
  password: string
}

class UserDTOImpl implements UserDTO {
  constructor(user: UserDTO) {
    this.id = user.id
    this.username = user.username
    this.created_at = user.created_at
    this.updated_at = user.updated_at
  }
  id: string
  username: string
  created_at: Date
  updated_at: Date
}

class UserImpl implements User {
  constructor(user: User) {
    this.id = user.id
    this.username = user.username
    this.password = user.password
    this.created_at = user.created_at
    this.updated_at = user.updated_at
  }
  id: string
  username: string
  password: string
  created_at: Date
  updated_at: Date
}

export { UserCreateImpl, UserUpdateImpl, UserDTOImpl, UserImpl }
