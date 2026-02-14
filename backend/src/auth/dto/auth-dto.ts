import type { LoginDTO } from "@shared/ts-types"
import { IsNotEmpty, IsString } from "class-validator"

class LoginDTOImpl implements LoginDTO {
  @IsNotEmpty()
  @IsString()
  username: string

  @IsNotEmpty()
  @IsString()
  password: string

  constructor(dto: LoginDTO) {
    this.username = dto.username
    this.password = dto.password
  }
}

export { LoginDTOImpl }
