import type { Result } from "@/types/Result"
import { Err, Ok } from "@/types/Result"
import { trimString } from "@/lib/util/string"
import { AxiosError } from "axios"

class APIClient {
  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_URL
    if (!baseURL) {
      throw new Error("NEXT_PUBLIC_API_URL is not defined")
    }
    this.baseURL = trimString(baseURL, "/")
  }

  private readonly baseURL: string
  protected getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
    }
  }
  static get shared() {
    return new APIClient()
  }

  protected async request<T>(
    path: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    body?: any,
  ): Promise<Result<T, AxiosError>> {
    const url = `${this.baseURL}/${trimString(path, "/")}`
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

  async get<T>(path: string): Promise<Result<T, AxiosError>> {
    return this.request<T>(path, "GET")
  }

  async post<T>(path: string, body: any): Promise<Result<T, AxiosError>> {
    return this.request<T>(path, "POST", body)
  }

  async put<T>(path: string, body: any): Promise<Result<T, AxiosError>> {
    return this.request<T>(path, "PUT", body)
  }

  async delete<T>(path: string): Promise<Result<T, AxiosError>> {
    return this.request<T>(path, "DELETE")
  }
}

export default APIClient
