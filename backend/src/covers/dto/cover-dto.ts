import type { CoverDTO, CoverUpdateDTO } from "@shared/ts-types/cover-dto"
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  IsObject,
  IsBoolean,
} from "class-validator"

class CoverDTOImpl implements CoverDTO {
  constructor(cover: CoverDTO) {
    this.id = cover.id
    this.url = cover.url
    this.created_at = cover.created_at
    this.updated_at = cover.updated_at
  }
  id: string
  url: string
  created_at: Date
  updated_at: Date
}

class CoverUpdateDTOImpl implements CoverUpdateDTO {
  @IsOptional()
  @IsString()
  url?: string

  @IsOptional()
  @IsString()
  song_id?: string
}
export { CoverDTOImpl, CoverUpdateDTOImpl }
