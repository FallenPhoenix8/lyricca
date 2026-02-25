import { cookies } from "next/headers"
import { redirect } from "next/navigation"
async function handler(req: Request) {
  ;(await cookies()).delete("token")
  const selfURL = process.env.SELF_URL
  if (!selfURL) {
    throw new Error("SELF_URL environment variable is not set.")
  }
  const signInUrl = new URL("/auth/sign-in", selfURL)
  redirect(signInUrl.href)
}

export const GET = handler
export const POST = handler
