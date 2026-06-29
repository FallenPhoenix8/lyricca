"use server"
import APIClient from "@/lib/data/APIClient"
import { Err, Ok, Result } from "@/types/Result"
import { COOKIE_OPTIONS } from "@/constants-server"
import { UserUpateSchema } from "@/lib/model/User"
import { ArkErrors } from "arktype"
import { ErrorResponseDTO, UserDTO } from "@shared/ts-types"
import { redirect } from "next/navigation"
import {
  fetchUpdateUser,
  fetchUserProfile,
  getToken,
} from "@/lib/data/server-fetch"

export type State = {
  errors?: {
    username?: string[]
    email?: string[]
    password?: string[]
  }
  message?: string | null
}

async function updateUserField(
  field: "username" | "email" | "password",
  formData: FormData,
): Promise<State> {
  const validatedFields = UserUpateSchema({
    [field]: formData.get(field),
  })
  const state: State = {
    errors: {
      username: [],
      email: [],
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

      if (error.message.toLowerCase().includes("email")) {
        state.errors?.email?.push(error.message)
      }
    })
    return state
  }

  const data = await fetchUpdateUser(validatedFields)
  if (!data.ok) {
    console.error("Failed to update username:", data.error)
    return {
      errors: {},
      message: "Something went wrong.",
    }
  }
  console.log(data.value)
  redirect("/app/preferences?security-group-state=open")
}

export async function editUsernameAction(
  prevState: State,
  formData: FormData,
): Promise<State> {
  return await updateUserField("username", formData)
}

export async function editEmailAction(
  prevState: State,
  formData: FormData,
): Promise<State> {
  return await updateUserField("email", formData)
}

export async function editPasswordAction(
  prevState: State,
  formData: FormData,
): Promise<State> {
  return await updateUserField("password", formData)
}
