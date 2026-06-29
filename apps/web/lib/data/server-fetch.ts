"use server"

import { Err, Ok, Result } from "@/types/Result"
import {
  ErrorResponseDTO,
  TranslationUsageDTO,
  UserDTO,
  UserUpdate,
} from "@shared/ts-types"
import { cookies } from "next/headers"
const apiURL = process.env.NEXT_PUBLIC_API_URL
if (!apiURL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set")
}

export async function getToken() {
  const token = (await cookies()).get("token")?.value ?? ""
  return token
}

export async function fetchUserProfile() {
  const token = await getToken()
  const endpoint = "users/me"
  const url = new URL(endpoint, apiURL)
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
  const data = (await response.json()) as UserDTO
  return data
}

export async function fetchTranslationUsage() {
  const token = await getToken()
  const endpoint = "translate/usage"
  const url = new URL(endpoint, apiURL)
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
  const data = (await response.json()) as TranslationUsageDTO
  return data
}

export async function fetchUpdateUser(
  updateUser: UserUpdate,
): Promise<Result<UserDTO, ErrorResponseDTO>> {
  const token = await getToken()
  const { id } = await fetchUserProfile()
  const endpoint = `users/${id}`
  const url = new URL(endpoint, apiURL)
  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(updateUser),
    })
    const data = (await response.json()) as UserDTO
    return Ok(data)
  } catch (error) {
    console.error("Failed to update user:", error)
    return Err({
      statusCode: 500,
      error: "Failed to update user.",
      message: ["Something went wrong."],
    })
  }
}
