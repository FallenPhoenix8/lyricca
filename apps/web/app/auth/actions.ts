"use server"
import APIClient from "@/lib/data/APIClient"
import { UserCreateSchema } from "@/lib/model/User"
import { AuthPayload } from "@shared/ts-types"
import { ArkErrors } from "arktype"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

const COOKIE_OPTIONS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge:
    process.env.NODE_ENV === "production" ? 60 * 60 * 24 * 30 : 60 * 60 * 2, // 30 days in production, 2 hours in development
} as {
  httpOnly: boolean
  secure: boolean
  sameSite: "strict" | "lax" | "none"
  path: string
  maxAge: number
}

export type State = {
  errors?: {
    username?: string[]
    password?: string[]
  }
  message?: string | null
}

export async function signUpAction(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const validatedFields = UserCreateSchema({
    username: formData.get("username"),
    password: formData.get("password"),
  })
  const state: State = {
    errors: {
      username: [],
      password: [],
    },
    message: null,
  }

  if (validatedFields instanceof ArkErrors) {
    validatedFields.flat().map((error) => {
      if (error.message.toLowerCase().includes("username")) {
        state.errors?.username?.push(error.message)
      }

      if (error.message.toLowerCase().includes("password")) {
        state.errors?.password?.push(error.message)
      }
    })
    return state
  }

  const data = await APIClient.shared.post<AuthPayload>(
    "/auth/sign-up",
    validatedFields,
  )
  console.log(data)
  if (!data.ok) {
    return {
      errors: {},
      message: "Couldn't sign up",
    }
  }

  ;(await cookies()).set("token", data.value.token, COOKIE_OPTIONS)

  redirect("/app/library")
}

export async function signInAction(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const fields = {
    username: formData.get("username") ?? "",
    password: formData.get("password") ?? "",
  }

  const data = await APIClient.shared.post<AuthPayload>("/auth/sign-in", fields)
  console.log(data)
  if (!data.ok) {
    return {
      errors: {},
      message: "Incorrect username or password",
    }
  }

  ;(await cookies()).set("token", data.value.token, COOKIE_OPTIONS)

  redirect("/app/library")
}
