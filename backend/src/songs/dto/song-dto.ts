import type {
  SongCreateDTO,
  SongUpdateDTO,
  SongDTO,
  Song,
} from "@shared/ts-types"
import { IsString, IsNotEmpty, IsEmpty, IsOptional } from "class-validator"
import { UserDTOImpl } from "../../user/dto/user-dto"

class SongImpl implements Song {
  constructor(song: Song) {
    this.id = song.id
    this.title = song.title
    this.artist = song.artist
    this.album = song.album
    this.original_lyrics = song.original_lyrics
    this.translated_lyrics = song.translated_lyrics
    this.created_at = song.created_at
    this.updated_at = song.updated_at
    this.user_id = song.user_id
    this.user = song.user
  }
  id: string
  title: string
  artist: string | null
  album: string | null
  original_lyrics: string
  translated_lyrics: string
  created_at: Date
  updated_at: Date
  user_id: string
  user: UserDTOImpl
}

class SongCreateDTOImpl implements SongCreateDTO {
  @IsNotEmpty()
  @IsString()
  title: string

  @IsNotEmpty()
  @IsString()
  original_lyrics: string

  @IsNotEmpty()
  @IsString()
  translated_lyrics: string

  @IsOptional()
  @IsString()
  artist: string | null

  @IsOptional()
  @IsString()
  album: string | null
}

class SongUpdateDTOImpl implements SongUpdateDTO {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  original_lyrics?: string

  @IsOptional()
  @IsString()
  translated_lyrics?: string

  @IsOptional()
  @IsString()
  artist?: string

  @IsOptional()
  @IsString()
  album?: string
}

class SongDTOImpl implements SongDTO {
  constructor(song: SongDTO) {
    this.id = song.id
    this.title = song.title
    this.artist = song.artist
    this.album = song.album
    this.original_lyrics = song.original_lyrics
    this.translated_lyrics = song.translated_lyrics
    this.created_at = song.created_at
    this.updated_at = song.updated_at
  }
  id: string
  title: string
  artist: string | null
  album: string | null
  original_lyrics: string
  translated_lyrics: string
  created_at: Date
  updated_at: Date
}

export { SongImpl, SongCreateDTOImpl, SongUpdateDTOImpl, SongDTOImpl }
