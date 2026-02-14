import type { LoginDTO } from "@shared/ts-types"
import { IsNotEmpty, IsString } from "class-validator"

class LoginDTOImpl implements LoginDTO {
  @IsNotEmpty()
  @IsString()
  username: string

  @IsNotEmpty()
  @IsString()
  password: string

  constructor(username: string, password: string) {
    this.username = username
    this.password = password
  }
}

export { LoginDTOImpl }
