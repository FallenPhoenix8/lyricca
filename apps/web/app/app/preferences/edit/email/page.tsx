"use client"

import { Button } from "@/components/ui/button"
import { useQueryState } from "nuqs"
import { useActionState, useEffect, useState } from "react"
import { editEmailAction, State } from "../actions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmailInput } from "@/components/ui/form/inputs/email-input"
import { ViewTransition } from "react"

export default function EditEmailPage() {
  const [_, setPageTitle] = useQueryState("title", { defaultValue: "" })
  const [email, setEmail] = useQueryState("email", { defaultValue: "" })
  useEffect(() => {
    setPageTitle("Edit Email")
  }, [])
  const initialState: State = {
    errors: {},
    message: null,
  }
  const [state, formAction, isPending] = useActionState(
    editEmailAction,
    initialState,
  )
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    console.log(state)
  }, [state])

  return (
    <ViewTransition name="edit-email">
      <form
        className="flex flex-col bg-secondary text-secondary-foreground max-w-xl px-2 md:px-4 py-2 rounded-lg md:rounded-l-none gap-6"
        action={formAction}
      >
        <h1 className="app-title-heading">Change Your Email</h1>

        <EmailInput
          email={email}
          setEmail={setEmail}
          onValidityChange={setIsValid}
        />
        <p className="text-destructive text-sm" aria-live="polite">
          {state.message || ""}
          {state.errors?.email &&
            state.errors.email.map((error) => {
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
