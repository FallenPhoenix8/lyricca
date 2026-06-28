"use client"
import { QueryClient, QueryClientProvider } from "react-query"
import { useActionState, useEffect, useMemo, useState } from "react"
import { signUpAction, State } from "../actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import BlobSceneNarrow from "@/components/ui/svg/BlobSceneNarrow"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmailInput } from "@/components/ui/form/inputs/email-input"
import { PasswordInput } from "@/components/ui/form/inputs/password-input"
import { UsernameInput } from "@/components/ui/form/inputs/username-input"

const queryClient = new QueryClient()

export default function SignUpPage() {
  const initialState: State = {
    errors: {},
    message: null,
  }

  const [username, setUsername] = useState("")
  const [isValidUsername, setIsValidUsername] = useState(false)
  const [password, setPassword] = useState("")
  const [isValidPassword, setIsValidPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [isValidEmail, setIsValidEmail] = useState(false)

  const [state, formAction, isPending] = useActionState(
    signUpAction,
    initialState,
  )
  return (
    <QueryClientProvider client={queryClient}>
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
            <h2 className="app-title-heading">Sign Up</h2>
            <p>Sign up to create an account and start using Lyricca!</p>

            <UsernameInput
              username={username}
              setUsername={setUsername}
              onValidityChange={setIsValidUsername}
            />
            <EmailInput
              email={email}
              setEmail={setEmail}
              onValidityChange={setIsValidEmail}
            />
            <PasswordInput
              password={password}
              setPassword={setPassword}
              onValidityChange={setIsValidPassword}
            />

            <p>
              Already have an account?{" "}
              <Link
                href="/auth/sign-in"
                className="underline underline-offset-4"
              >
                Sign In!
              </Link>
            </p>
            <Button
              type="submit"
              variant="default"
              className="max-w flex items-center"
              disabled={
                !isValidPassword ||
                !isValidUsername ||
                !isValidEmail ||
                isPending
              }
            >
              {isPending && <LoadingSpinner className="w-5 h-5 mr-2" />}
              <div>Sign Up</div>
            </Button>

            <p
              id="sign-in-error"
              className="text-destructive"
              aria-live="polite"
            >
              {state.message ?? " "}
              {state.errors?.username?.join(", ")}
              {state.errors?.password?.join(", ")}
            </p>
          </main>
        </form>
      </div>
    </QueryClientProvider>
  )
}
