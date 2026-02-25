export const COOKIE_OPTIONS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge:
    process.env.NODE_ENV === "production" ? 60 * 60 * 24 * 30 : 60 * 60 * 2, // 30 days in production, 2 hours in development
} as {
  httpOnly: boolean
  secure: boolean
  sameSite: "strict" | "lax" | "none"
  path: string
  maxAge: number
}
