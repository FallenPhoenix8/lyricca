import type { Result } from "@/types/Result"
import { Err, Ok } from "@/types/Result"
import { trimString } from "@/lib/util/string"
import { AxiosError } from "axios"

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
  ): Promise<Result<T, AxiosError>> {
    const url = `/api/backend/${trimString(endpoint, "/")}`
    const headers = this.getHeaders()
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!response.ok) {
        return Err(
          new AxiosError(`${response.statusText}`, response.status.toString()),
        )
      }
      const data = await response.json()
      return Ok(data)
    } catch (error) {
      return Err(error as AxiosError)
    }
  }

  async get<T>(endpoint: string): Promise<Result<T, AxiosError>> {
    return this.request<T>(endpoint, "GET")
  }

  async post<T>(endpoint: string, body: any): Promise<Result<T, AxiosError>> {
    return this.request<T>(endpoint, "POST", body)
  }

  async put<T>(endpoint: string, body: any): Promise<Result<T, AxiosError>> {
    return this.request<T>(endpoint, "PUT", body)
  }

  async patch<T>(endpoint: string, body: any): Promise<Result<T, AxiosError>> {
    return this.request<T>(endpoint, "PATCH", body)
  }

  async delete<T>(endpoint: string): Promise<Result<T, AxiosError>> {
    return this.request<T>(endpoint, "DELETE")
  }
}

export default APIClient
