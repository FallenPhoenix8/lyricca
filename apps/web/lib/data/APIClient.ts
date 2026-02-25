import type { Result } from "@/types/Result"
import { Err, Ok } from "@/types/Result"
import { trimString } from "@/lib/util/string"
import { AxiosError } from "axios"
import { ApiError } from "next/dist/server/api-utils"
import { ErrorResponseDTO } from "@shared/ts-types"
import { redirect } from "next/navigation"

class APIClient {
  protected getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
    }
  }
  static get shared() {
    return new APIClient()
  }

  protected async request<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    body?: any,
  ): Promise<Result<T, ErrorResponseDTO>> {
    let baseURL: string = "/api/backend"
    if (typeof window === "undefined") {
      console.log("Running in server")
      if (!process.env.SELF_URL) {
        throw new Error("`SELF_URL` environment variable is not set")
      }
      baseURL = trimString(process.env.SELF_URL, "/") + baseURL
    }
    const url = `${baseURL}/${trimString(endpoint, "/")}`
    console.log(`Making ${method} request to ${url} with body:`, body)
    const headers = this.getHeaders()
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: "include",
      })
      const data = await response.json()

      // * MARK: - Redirect to sign-in page if unauthorized
      if (response.status === 401) {
        redirect("/auth/sign-in")
      }

      if (!response.ok) {
        return Err(data as ErrorResponseDTO)
      }
      return Ok(data)
    } catch (error) {
      console.error("Error making request to API:", error)
      const errorResponse = error as ErrorResponseDTO
      return Err(errorResponse)
    }
  }

  async get<T>(endpoint: string): Promise<Result<T, ErrorResponseDTO>> {
    return this.request<T>(endpoint, "GET")
  }

  async post<T>(
    endpoint: string,
    body: any,
  ): Promise<Result<T, ErrorResponseDTO>> {
    return this.request<T>(endpoint, "POST", body)
  }

  async put<T>(
    endpoint: string,
    body: any,
  ): Promise<Result<T, ErrorResponseDTO>> {
    return this.request<T>(endpoint, "PUT", body)
  }

  async patch<T>(
    endpoint: string,
    body: any,
  ): Promise<Result<T, ErrorResponseDTO>> {
    return this.request<T>(endpoint, "PATCH", body)
  }

  async delete<T>(endpoint: string): Promise<Result<T, ErrorResponseDTO>> {
    return this.request<T>(endpoint, "DELETE")
  }
}

export default APIClient
