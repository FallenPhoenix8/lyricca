import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { joinAsPathForUrl } from "@/lib/util/string"

const ALLOWED_PREFIXES = [
  "/songs",
  "/auth/sign-in",
  "/auth/sign-up",
  "/users/availability",
]

function isAllowedPrefix(path: string) {
  return ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix))
}

async function makeRequest(props: {
  method: string // Any HTTP method
  url: URL
  body: string | FormData | undefined | ArrayBuffer
  headers: Record<string, string>
}) {
  return await fetch(props.url, {
    method: props.method,
    body: props.body,
    headers: { ...props.headers, "x-from-next-gate": "1" },
    cache: "no-store",
    credentials: "include",
  })
}

async function handler(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  // * MARK: - Prepare backend URL and check if it's allowed
  const { path } = await ctx.params
  const backendPath = `/${joinAsPathForUrl(...path)}`
  console.log(`Received request for backend path: ${backendPath}`)
  if (!isAllowedPrefix(backendPath)) {
    return NextResponse.json(
      { error: "forbidden for forwarding" },
      { status: 403 },
    )
  }
  const url = new URL(req.url)
  const apiURL = process.env.NEXT_PUBLIC_API_URL
  console.log(`API URL: ${apiURL}`)
  if (!apiURL || !URL.parse(apiURL)) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_API_URL is not set" },
      { status: 500 },
    )
  }
  const backendFullURL = URL.parse(backendPath, apiURL)
  if (!backendFullURL) {
    return NextResponse.json(
      { error: "invalid backend path", path: backendPath },
      { status: 500 },
    )
  }
  backendFullURL.search = url.search

  const cookieHeader = (await cookies()).toString()
  console.log("Cookies: ", cookieHeader)
  console.log("Headers: ", req.headers)

  // Forward body only when present
  const hasBody = !["GET", "HEAD"].includes(req.method)

  // * MARK: - Make request to backend
  const response = await makeRequest({
    method: req.method,
    url: backendFullURL,
    body: hasBody ? await req.arrayBuffer() : undefined,
    headers: {
      cookie: cookieHeader,
      "content-type": req.headers.get("content-type")
        ? req.headers.get("content-type")!
        : "application/json",
    },
  })

  // * MARK: - Prepare response
  const buffer = await response.arrayBuffer()
  const res = new NextResponse(buffer, {
    status: response.status,
  })

  const contentType = response.headers.get("content-type") ?? "application/json"
  res.headers.set("content-type", contentType)

  console.log("Response headers:", res.headers)
  return res
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
