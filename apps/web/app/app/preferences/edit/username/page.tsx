"use client"

import { Button } from "@/components/ui/button"
import { UsernameInput } from "@/components/ui/form/inputs/username-input"
import { useQueryState } from "nuqs"
import { useActionState, useEffect, useState } from "react"
import { editUsernameAction, State } from "../actions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ViewTransition } from "react"

export default function EditUsernamePage() {
  const [_, setPageTitle] = useQueryState("title", { defaultValue: "" })
  const [username, setUsername] = useQueryState("username", {
    defaultValue: "",
  })
  useEffect(() => {
    setPageTitle("Edit Username")
  }, [])
  const initialState: State = {
    errors: {},
    message: null,
  }
  const [state, formAction, isPending] = useActionState(
    editUsernameAction,
    initialState,
  )
  const [isValid, setIsValid] = useState(false)

  return (
    <ViewTransition name="edit-username">
      <form
        className="flex flex-col bg-secondary text-secondary-foreground max-w-xl px-2 md:px-4 py-2 rounded-lg md:rounded-l-none gap-6"
        action={formAction}
      >
        <h1 className="app-title-heading">Change Your Username</h1>

        <UsernameInput
          username={username}
          setUsername={setUsername}
          onValidityChange={setIsValid}
        />
        <p className="text-destructive text-sm" aria-live="polite">
          {state.message || ""}
          {state.errors?.username &&
            state.errors.username.map((error) => {
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
