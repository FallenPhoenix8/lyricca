"use client"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/form/inputs/password-input"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import BlobSceneNarrow from "@/components/ui/svg/BlobSceneNarrow"
import { useActionState, useState } from "react"
import { resetPasswordAction, State } from "../actions"
import { useQueryState } from "nuqs"

export default function ResetPasswordPage() {
  const initialState: State = {
    errors: {},
    message: null,
  }

  const [password, setPassword] = useState("")
  const [isValidPassword, setIsValidPassword] = useState(false)
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    initialState,
  )
  const [token] = useQueryState("token", { defaultValue: "" })
  return (
    <div className="flex">
      <form
        action={(formData) => {
          formAction(formData)
        }}
        className="flex md:border-2 border-border mx-auto rounded-lg h-fit mt-10 md:shadow-lg shadow-muted-foreground/10 bg-background dark:bg-secondary/10"
        aria-describedby="sign-in-error"
      >
        <BlobSceneNarrow className="transform-[scaleX(-1)] h-full shrink rounded-r-lg rounded-tl-lg hidden lg:block border-l border-border" />
        <main className="flex flex-col gap-4 max-w-xl p-10 lg:p-4">
          <h2 className="app-title-heading">Reset Password</h2>
          <p>You can reset your password here.</p>

          <input type="hidden" name="token" value={token} />

          <PasswordInput
            password={password}
            setPassword={setPassword}
            onValidityChange={setIsValidPassword}
          />

          <Button
            type="submit"
            variant="default"
            className="max-w flex items-center"
            disabled={!isValidPassword || isPending}
          >
            {isPending && <LoadingSpinner className="w-5 h-5 mr-2" />}
            <div>Sign Up</div>
          </Button>

          <p id="sign-in-error" className="text-destructive" aria-live="polite">
            {state.message ?? " "}
            {state.errors?.username?.join(", ")}
            {state.errors?.password?.join(", ")}
          </p>
        </main>
      </form>
    </div>
  )
}
