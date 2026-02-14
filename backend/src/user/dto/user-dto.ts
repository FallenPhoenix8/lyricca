import type { UserCreate, UserUpdate, UserDTO, User } from "@shared/ts-types"
import {
  IsNotEmpty,
  IsStrongPassword,
  IsString,
  IsOptional,
} from "class-validator"
import { SongDTOImpl } from "../../songs/dto/song-dto"

class UserCreateImpl implements UserCreate {
  @IsNotEmpty()
  @IsString()
  username: string

  @IsNotEmpty()
  @IsStrongPassword()
  password: string

  constructor(dto: UserCreate) {
    this.username = dto.username
    this.password = dto.password
  }
}

class UserUpdateImpl implements UserUpdate {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string

  @IsOptional()
  @IsStrongPassword()
  password?: string
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
    this.songs = user.songs.map((song) => new SongDTOImpl(song))
  }
  id: string
  username: string
  password: string
  created_at: Date
  updated_at: Date
  songs: SongDTOImpl[]
}

export { UserCreateImpl, UserUpdateImpl, UserDTOImpl, UserImpl }
