import { AuthPayload } from "@shared/ts-types"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { COOKIE_OPTIONS } from "./constants-server"

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/landing", request.url))
  }

  const signInURL = new URL("/auth/sign-in", request.url)
  const appLibraryURL = new URL("/app/library", request.url)

  const isAuthRoute =
    pathname === "/auth/sign-in" || pathname === "/auth/sign-up"
  const isAppRoute = pathname.startsWith("/app")

  const token = request.cookies.get("token")?.value ?? ""
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_API_URL is not set" },
      { status: 500 },
    )
  }

  // If you want to avoid calling refresh when no token exists:
  let ok = false
  let newToken: string | undefined

  if (token) {
    const apiRefreshURL = new URL("/auth/refresh", apiUrl)
    const apiResponse = await fetch(apiRefreshURL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    ok = apiResponse.ok

    if (apiResponse.ok && apiResponse.status !== 204) {
      const data = (await apiResponse.json()) as AuthPayload
      newToken = data.token
    }
  }

  // Auth pages: only redirect to app if already authorized
  if (isAuthRoute) {
    if (ok) {
      const res = NextResponse.redirect(appLibraryURL)
      if (newToken) res.cookies.set("token", newToken, COOKIE_OPTIONS)
      return res
    }
    return NextResponse.next()
  }

  // App pages: require authorization
  if (isAppRoute) {
    if (!ok) return NextResponse.redirect(signInURL)
    const res = NextResponse.next()
    if (newToken) res.cookies.set("token", newToken, COOKIE_OPTIONS)
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/app/:path*", "/auth/sign-in", "/auth/sign-up", "/"],
}
