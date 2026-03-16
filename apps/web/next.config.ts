import type { NextConfig } from "next"

const IMAGE_HOST = process.env.NEXT_PUBLIC_IMAGE_HOST
if (!IMAGE_HOST || !new URL(IMAGE_HOST)) {
  throw new Error(
    "NEXT_PUBLIC_IMAGE_HOST is not set or is invalid URL (can end with ** or * for universal paths)",
  )
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL(IMAGE_HOST)],
  },
  experimental: {
    viewTransition: true,
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
}

export default nextConfig
