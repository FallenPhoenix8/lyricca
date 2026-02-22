import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { joinAsPathForUrl } from "@/lib/util/string"

const ALLOWED_PREFIXES = ["/songs"]

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
  })
}

async function handler(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  // * MARK: - Prepare backend URL and check if it's allowed
  const { path } = await ctx.params
  const backendPath = `${joinAsPathForUrl(...path)}`
  if (!isAllowedPrefix(backendPath)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  const url = new URL(req.url)
  const apiURL = process.env.NEXT_PUBLIC_BACKEND_URL
  if (!apiURL || URL.parse(apiURL)) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_BACKEND_URL is not set" },
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
  const contentType = response.headers.get("content-type") ?? "application/json"
  const buffer = await response.arrayBuffer()

  return new NextResponse(buffer, {
    status: response.status,
    headers: { "content-type": contentType },
  })
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
