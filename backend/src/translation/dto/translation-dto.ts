import type { TranslationInputDTO } from "@shared/ts-types"
import { IsNotEmpty, IsOptional, IsString } from "class-validator"

class TranslationInputDTOImpl implements TranslationInputDTO {
  @IsNotEmpty()
  @IsString()
  text: string

  @IsNotEmpty()
  @IsString()
  to: string

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  from?: string
}

export { TranslationInputDTOImpl }
