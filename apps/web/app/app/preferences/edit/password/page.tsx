"use client"

import { Button } from "@/components/ui/button"
import { UsernameInput } from "@/components/ui/form/inputs/username-input"
import { Spacer } from "@/components/ui/layout"
import { useQueryState } from "nuqs"
import { useActionState, useEffect, useState } from "react"
import { editPasswordAction, State } from "../actions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { PasswordInput } from "@/components/ui/form/inputs/password-input"
import { ViewTransition } from "react"

export default function EditPasswordPage() {
  const [_, setPageTitle] = useQueryState("title", { defaultValue: "" })
  const [password, setPassword] = useState("")
  useEffect(() => {
    setPageTitle("Edit Password")
  }, [])
  const initialState: State = {
    errors: {},
    message: null,
  }
  const [state, formAction, isPending] = useActionState(
    editPasswordAction,
    initialState,
  )
  const [isValid, setIsValid] = useState(false)

  return (
    <ViewTransition name="edit-password">
      <form
        className="flex flex-col bg-secondary text-secondary-foreground max-w-xl px-2 md:px-4 py-2 rounded-lg md:rounded-l-none gap-6"
        action={formAction}
      >
        <h1 className="app-title-heading">Change Your Password</h1>

        <PasswordInput
          password={password}
          setPassword={setPassword}
          onValidityChange={setIsValid}
        />
        <p className="text-destructive text-sm" aria-live="polite">
          {state.message || ""}
          {state.errors?.password &&
            state.errors.password.map((error) => {
              return error
            })}
        </p>
        <Button
          className="mt-auto w-full"
          size="lg"
          disabled={!isValid || isPending}
        >
          {isPending && <LoadingSpinner className="w-5 h-5 mr-2" />}
          Save
        </Button>
      </form>
    </ViewTransition>
  )
}
