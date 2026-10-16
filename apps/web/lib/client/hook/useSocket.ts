"use client"
import APIClient from "@/lib/data/APIClient"
import { UserDTO } from "@shared/ts-types"
import { useQuery } from "react-query"
import { io } from "socket.io-client"

const apiUrl = process.env.NEXT_PUBLIC_API_URL
if (!apiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is not set")
}

export function useSocket(path: string) {
  const user = useQuery("user", () =>
    APIClient.shared.get<UserDTO>("/users/me"),
  )
  if (!user.data || !user.data.ok) {
    return null
  }

  return io([apiUrl, "songs"].map((s) => s?.trim()).join("/"), {
    autoConnect: false,
    query: { userId: user.data.value.id },
    auth: { userId: user.data.value.id },
  })
}
