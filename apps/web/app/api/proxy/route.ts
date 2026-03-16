import { NextRequest } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const imageUrl = searchParams.get("url")

  if (!imageUrl) {
    return new Response("Missing URL parameter", { status: 400 })
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": req.headers.get("user-agent") ?? "LyriccaApp/1.0",
      },
    })

    if (!response.ok) {
      return new Response(`Failed to fetch image: ${response.statusText}`, {
        status: response.status,
      })
    }

    // Forward the image data and the correct content-type
    const blob = await response.blob()
    return new Response(blob, {
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
      },
    })
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 })
  }
}
