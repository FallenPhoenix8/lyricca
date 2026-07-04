"use server"
import { UserUpdateSchema } from "@/lib/model/User"
import { redirect } from "next/navigation"
import { fetchUpdateUser } from "@/lib/data/server-fetch"
import { z } from "zod"

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
  // Use safeParse to cleanly evaluate dynamic form fields
  const result = UserUpdateSchema.safeParse({
    [field]: formData.get(field),
  })

  // Handle validation failures using the flatError utility
  if (!result.success) {
    const flatErrors = z.flattenError(result.error)

    return {
      errors: {
        username: flatErrors.fieldErrors.username || [],
        email: flatErrors.fieldErrors.email || [],
        password: flatErrors.fieldErrors.password || [],
      },
      message: "Validation failed.",
    }
  }

  // Pass the successfully validated object down to your fetch function
  const data = await fetchUpdateUser(result.data)
  if (!data.ok) {
    console.error(`Failed to update ${field}:`, data.error)
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
