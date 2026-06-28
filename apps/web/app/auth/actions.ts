"use server"
import APIClient from "@/lib/data/APIClient"
import { UserCreateSchema } from "@/lib/model/User"
import { AuthPayload } from "@shared/ts-types"
import { ArkErrors } from "arktype"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { COOKIE_OPTIONS } from "@/constants-server"
import { checkIsPasswordValid } from "@/lib/utils"

export type State = {
  errors?: {
    token?: string[]
    username?: string[]
    password?: string[]
    email?: string[]
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
    email: formData.get("email"),
  })
  const state: State = {
    errors: {
      username: [],
      password: [],
      email: [],
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

  // If the APIClient redirected (401), this line is never reached.
  // If the API returned a structured error (400, 500), we handle it here.
  if (!data.ok) {
    return {
      errors: {},
      message: data.error?.message[0] ?? "Incorrect username or password",
    }
  }

  ;(await cookies()).set("token", data.value.token, COOKIE_OPTIONS)

  // This throws a NEW redirect error
  redirect("/app/library")
}

export async function resetPasswordAction(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const token = formData.get("token")
  const password = formData.get("password")
  const passwordConfirmation = formData.get("passwordConfirmation")
  if (!token || !password || !passwordConfirmation) {
    return {
      errors: {
        token: ["Token is required."],
        password: ["Password and password confirmation are required."],
      },
      message: "Invalid token or password",
    }
  }

  if (
    typeof token !== "string" ||
    typeof password !== "string" ||
    typeof passwordConfirmation !== "string"
  ) {
    return {
      errors: {
        token: ["Token is invalid."],
        password: ["Password and/or password confirmation are invalid."],
      },
      message: "Invalid token or password",
    }
  }

  const passwordValidity = checkIsPasswordValid(password, password)
  if (!passwordValidity.isValid) {
    return {
      errors: {
        password: [
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character. It must also match the password confirmation.",
        ],
      },
      message: "Invalid password",
    }
  }

  try {
    const result = await APIClient.shared.post<{ message: string }>(
      "/auth/reset-password",
      {
        token,
        password,
      },
    )
    console.log(result)
    if (!result.ok) {
      return {
        errors: {},
        message: result.error.message.join(", "),
      }
    }
    if (!result.value.message.includes("success")) {
      return {
        errors: {},
        message: result.value.message,
      }
    }
  } catch (error) {
    console.error("Failed to send reset password email:", error)
    return {
      errors: {},
      message: "Something went wrong.",
    }
  }
  redirect("/auth/sign-in")
}
