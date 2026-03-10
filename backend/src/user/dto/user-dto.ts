import type {
  UserCreate,
  UserUpdate,
  UserDTO,
  User,
  AvailabilityCheckDTO,
} from "@shared/ts-types"
import {
  IsNotEmpty,
  IsStrongPassword,
  IsString,
  IsOptional,
  IsUrl,
} from "class-validator"
import { SongDTOImpl } from "../../songs/dto/song-dto"

class UserCreateImpl implements UserCreate {
  @IsNotEmpty()
  @IsString()
  username: string

  @IsNotEmpty()
  @IsStrongPassword()
  password: string

  constructor(username: string, password: string) {
    this.username = username
    this.password = password
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

  @IsOptional()
  @IsUrl()
  profile_url?: string
}

class UserDTOImpl implements UserDTO {
  constructor(user: UserDTO) {
    this.id = user.id
    this.username = user.username
    this.created_at = user.created_at
    this.updated_at = user.updated_at
    this.profile_url = user.profile_url
  }
  id: string
  username: string
  created_at: Date
  updated_at: Date
  profile_url: string | null
}

class UserImpl implements User {
  constructor(user: User) {
    this.id = user.id
    this.username = user.username
    this.password = user.password
    this.created_at = user.created_at
    this.updated_at = user.updated_at
    this.songs = user.songs.map((song) => new SongDTOImpl(song))
    this.profile_url = user.profile_url
  }
  id: string
  username: string
  password: string
  created_at: Date
  updated_at: Date
  songs: SongDTOImpl[]
  profile_url: string | null
}

class AvailabilityCheckDTOImpl implements AvailabilityCheckDTO {
  constructor(username: string, available: boolean) {
    this.username = username
    this.available = available
  }
  username: string
  available: boolean
}

export {
  UserCreateImpl,
  UserUpdateImpl,
  UserDTOImpl,
  UserImpl,
  AvailabilityCheckDTOImpl,
}
