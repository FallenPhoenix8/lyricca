import type { Result } from "@/types/Result"
import { Err, Ok } from "@/types/Result"
import { trimString } from "@/lib/util/string"
import { AxiosError } from "axios"
import { ApiError } from "next/dist/server/api-utils"
import { ErrorResponseDTO } from "@shared/ts-types"
import { redirect } from "next/navigation"
import { isRedirectError } from "next/dist/client/components/redirect-error"

class APIClient {
  protected getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
    }
  }
  static get shared() {
    return new APIClient()
  }

  private isBlobLike(value: unknown): value is Blob {
    return typeof Blob !== "undefined" && value instanceof Blob
  }

  private isFileLike(value: unknown): value is File {
    return typeof File !== "undefined" && value instanceof File
  }

  private hasFile(value: unknown): boolean {
    if (!value) return false

    if (this.isBlobLike(value) || this.isFileLike(value)) {
      return true
    }

    if (Array.isArray(value)) {
      return value.some((item) => this.hasFile(item))
    }

    if (typeof value === "object") {
      return Object.values(value as Record<string, unknown>).some((item) =>
        this.hasFile(item),
      )
    }

    return false
  }

  private toFormData(body: Record<string, any>): FormData {
    const formData = new FormData()

    Object.entries(body).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return
      }

      if (this.isFileLike(value) || this.isBlobLike(value)) {
        formData.append(key, value)
        return
      }

      /**
       * Multiple files under the same field name:
       * files: [File, File]
       */
      if (
        Array.isArray(value) &&
        value.every((item) => this.isFileLike(item) || this.isBlobLike(item))
      ) {
        value.forEach((file) => {
          formData.append(key, file)
        })
        return
      }

      /**
       * DTO arrays/objects need to be sent as JSON strings.
       */
      if (Array.isArray(value) || typeof value === "object") {
        formData.append(key, JSON.stringify(value))
        return
      }

      formData.append(key, String(value))
    })

    return formData
  }

  protected async request<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    body?: any,
    token?: string,
  ): Promise<Result<T, ErrorResponseDTO>> {
    let baseURL: string = "/api/backend"

    if (typeof window === "undefined") {
      console.log("Making request on server...")

      if (!process.env.SELF_URL) {
        throw new Error("`SELF_URL` environment variable is not set")
      }

      baseURL = trimString(process.env.SELF_URL, "/") + baseURL
    }

    const url = `${baseURL}/${trimString(endpoint, "/")}`

    const rawHeaders = this.getHeaders() as Record<string, string>

    const {
      ["Content-Type"]: _contentTypeUpper,
      ["content-type"]: _contentTypeLower,
      ...headersWithoutContentType
    } = rawHeaders

    const headers: Record<string, string> = {
      ...headersWithoutContentType,
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const shouldUseFormData = body instanceof FormData || this.hasFile(body)

    let requestBody: BodyInit | undefined

    if (method !== "GET" && body !== undefined) {
      if (shouldUseFormData) {
        requestBody = body instanceof FormData ? body : this.toFormData(body)

        /**
         * Do NOT set Content-Type for FormData.
         * fetch will add multipart/form-data with the correct boundary.
         */
      } else {
        headers["Content-Type"] = "application/json"
        requestBody = JSON.stringify(body)
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: requestBody,
        credentials: "include",
      })

      if (response.status === 401) {
        redirect("/auth/sign-in")
      }

      const responseContentType = response.headers.get("content-type")

      const data = responseContentType?.includes("application/json")
        ? await response.json()
        : null

      if (!response.ok) {
        return Err(data as ErrorResponseDTO)
      }

      return Ok(data as T)
    } catch (error) {
      if (isRedirectError(error)) {
        throw error
      }

      console.error("Error making request to API:", error)

      const errorResponse = (error as any)?.response?.data || error
      return Err(errorResponse as ErrorResponseDTO)
    }
  }

  async get<T>(
    endpoint: string,
    token?: string,
  ): Promise<Result<T, ErrorResponseDTO>> {
    return this.request<T>(endpoint, "GET", undefined, token)
  }

  async post<T>(
    endpoint: string,
    body: any,
    token?: string,
  ): Promise<Result<T, ErrorResponseDTO>> {
    return this.request<T>(endpoint, "POST", body, token)
  }

  async put<T>(
    endpoint: string,
    body: any,
    token?: string,
  ): Promise<Result<T, ErrorResponseDTO>> {
    return this.request<T>(endpoint, "PUT", body, token)
  }

  async patch<T>(
    endpoint: string,
    body: any,
    token?: string,
  ): Promise<Result<T, ErrorResponseDTO>> {
    return this.request<T>(endpoint, "PATCH", body, token)
  }

  async delete<T>(
    endpoint: string,
    body: any,
    token?: string,
  ): Promise<Result<T, ErrorResponseDTO>> {
    return this.request<T>(endpoint, "DELETE", body, token)
  }
}

export default APIClient
