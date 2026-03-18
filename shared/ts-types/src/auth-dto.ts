type AuthPayload = {
  token: string
}

type LoginDTO = {
  username: string
  password: string
  email: string
}
export type { AuthPayload, LoginDTO }
