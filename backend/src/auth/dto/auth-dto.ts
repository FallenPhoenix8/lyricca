import type { LoginDTO } from "@shared/ts-types"
import { IsEmail, IsNotEmpty, IsString } from "class-validator"

class LoginDTOImpl implements LoginDTO {
  @IsNotEmpty()
  @IsString()
  username: string

  @IsNotEmpty()
  @IsString()
  password: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  constructor(username: string, password: string, email: string) {
    this.username = username
    this.password = password
    this.email = email
  }
}

export { LoginDTOImpl }
