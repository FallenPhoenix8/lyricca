type AuthPayload = {
  token: string
}

type LoginDTO = {
  username: string
  password: string
  email: string
}

type ForgotPasswordDTO = {
  email: string
}

type ResetPasswordDTO = {
  token: string
  password: string
}

export type { AuthPayload, LoginDTO, ForgotPasswordDTO, ResetPasswordDTO }
