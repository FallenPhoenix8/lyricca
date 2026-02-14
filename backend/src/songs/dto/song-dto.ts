import type {
  SongCreateDTO,
  SongUpdateDTO,
  SongDTO,
  Song,
  SongCheckAllInputItem,
  SongCheckAllInput,
  SongCheckAllOutput,
} from "@shared/ts-types/song-dto"
import {
  IsString,
  IsNotEmpty,
  IsEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  IsObject,
  IsBoolean,
  IsDate,
  IsArray,
  ValidateNested,
} from "class-validator"
import { Type } from "class-transformer"
import { UserDTOImpl } from "../../user/dto/user-dto"
import { CoverDTOImpl } from "../../covers/dto/cover-dto"

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
    this.cover_id = song.cover_id
    this.cover = song.cover ? new CoverDTOImpl(song.cover) : null
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
  cover_id: string | null
  cover: CoverDTOImpl | null
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

  constructor(dto: SongCreateDTO) {
    this.title = dto.title
    this.original_lyrics = dto.original_lyrics
    this.translated_lyrics = dto.translated_lyrics
    this.artist = dto.artist
    this.album = dto.album
  }
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
    this.cover = song.cover ? new CoverDTOImpl(song.cover) : null
  }
  id: string
  title: string
  artist: string | null
  album: string | null
  original_lyrics: string
  translated_lyrics: string
  created_at: Date
  updated_at: Date
  cover: CoverDTOImpl | null
}

class SongCheckAllInputItemImpl implements SongCheckAllInputItem {
  @IsNotEmpty()
  @IsUUID()
  id: string

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  updated_at: Date

  constructor(item: SongCheckAllInputItem) {
    this.id = item.id
    this.updated_at = item.updated_at
  }
}

class SongCheckAllInputImpl implements SongCheckAllInput {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SongCheckAllInputItemImpl)
  items: SongCheckAllInputItemImpl[]

  constructor(input: SongCheckAllInput) {
    this.items = input.items.map((item) => new SongCheckAllInputItemImpl(item))
  }
}

class SongCheckAllOutputImpl implements SongCheckAllOutput {
  constructor(output: SongCheckAllOutput) {
    this.toBeUpdated = output.toBeUpdated
    this.toBeCreated = output.toBeCreated
    this.toBeDeleted = output.toBeDeleted
  }
  toBeUpdated: string[]
  toBeCreated: string[]
  toBeDeleted: string[]
}

export {
  SongImpl,
  SongCreateDTOImpl,
  SongUpdateDTOImpl,
  SongDTOImpl,
  SongCheckAllInputItemImpl,
  SongCheckAllInputImpl,
  SongCheckAllOutputImpl,
}
