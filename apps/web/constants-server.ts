export const COOKIE_OPTIONS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
} as {
  httpOnly: boolean
  secure: boolean
  sameSite: "strict" | "lax" | "none"
  path: string
  maxAge: number
}
