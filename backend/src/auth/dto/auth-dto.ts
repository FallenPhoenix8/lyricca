import type {
  ForgotPasswordDTO,
  LoginDTO,
  ResetPasswordDTO,
} from "@shared/ts-types"
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from "class-validator"

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

class ForgotPasswordDTOImpl implements ForgotPasswordDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string
}

class ResetPasswordDTOImpl implements ResetPasswordDTO {
  @IsNotEmpty()
  @IsString()
  token: string

  @IsNotEmpty()
  @IsStrongPassword()
  password: string
}

export { LoginDTOImpl, ForgotPasswordDTOImpl, ResetPasswordDTOImpl }
