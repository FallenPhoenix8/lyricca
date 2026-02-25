"use client"
import {
  useActionState,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { signInAction } from "../actions"
import {
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  SpinnerIcon,
  XIcon,
} from "@phosphor-icons/react"
import type { State } from "../actions"
import TextField from "@/components/ui/form/TextField"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import BlobScene from "@/components/ui/svg/BlobScene"
import clsx from "clsx"

function UsernameInput({
  value,
  setValue,
}: {
  value: string
  setValue: React.Dispatch<React.SetStateAction<string>>
}) {
  const [isInvalid, setIsInvalid] = useState(false)
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value)
    // If the username is empty, set the isInvalid state to true
    if (event.target.value === "") {
      setIsInvalid(true)
    } else {
      setIsInvalid(false)
    }
  }
  return (
    <TextField
      label="Username"
      name="username"
      placeholder="Username"
      addon={<UserIcon className="w-5 h-5" weight="bold" />}
      isInvalid={isInvalid}
      description={{
        default: "Enter your username",
        error: "Username cannot be empty",
      }}
      required
      onChange={handleChange}
      value={value}
    />
  )
}

function PasswordInput({
  value,
  setValue,
}: {
  value: string
  setValue: React.Dispatch<React.SetStateAction<string>>
}) {
  const [isInvalid, setIsInvalid] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value)
    // If the password is empty, set the isInvalid state to true
    if (event.target.value === "") {
      setIsInvalid(true)
    } else {
      setIsInvalid(false)
    }
  }

  function PasswordVisibilityButton() {
    return (
      <Button
        variant="outline"
        size="icon-xs"
        onClick={() => setIsVisible(!isVisible)}
      >
        {isVisible ? (
          <EyeIcon className="w-5 h-5" weight="bold" />
        ) : (
          <EyeSlashIcon className="w-5 h-5" weight="bold" />
        )}
      </Button>
    )
  }

  return (
    <TextField
      label="Password"
      name="password"
      type={isVisible ? "text" : "password"}
      placeholder="Password"
      addon={<PasswordVisibilityButton />}
      addonAlignment="inline-end"
      isInvalid={isInvalid}
      description={{
        default: "Enter your password",
        error: "Password cannot be empty",
      }}
      required
      onChange={handleChange}
      value={value}
    />
  )
}

export default function SignInPage() {
  const initialState: State = {
    errors: {},
    message: null,
  }

  const [state, formAction] = useActionState(signInAction, initialState)
  const [isPending, setIsPending] = useState(false)

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="flex">
      <form
        action={(formData) => {
          setIsPending(true)
          formAction(formData)
          setIsPending(false)
        }}
        className="flex md:border-2 border-border mx-auto rounded-lg h-fit mt-10"
        aria-describedby="sign-in-error"
      >
        <BlobScene className="h-full w-xs lg:w-sm transform-[scaleX(-1)] rounded-lg hidden md:block border-r-2 border-border" />
        <main className="flex flex-col gap-4 p-4 max-w-sm lg:w-md">
          <h2 className="text-3xl font-semibold">Sign In</h2>
          <UsernameInput value={username} setValue={setUsername} />
          <PasswordInput value={password} setValue={setPassword} />
          <p>
            Don't have an account yet?{" "}
            <Link href="/auth/sign-up" className="underline underline-offset-4">
              Sign Up!
            </Link>
          </p>

          <Button
            type="submit"
            variant="default"
            className="max-w flex items-center"
            disabled={isPending || username === "" || password === ""}
          >
            {isPending && <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />}
            <div>Sign In</div>
          </Button>

          <p id="sign-in-error" className="text-destructive" aria-live="polite">
            {state.message ?? " "}
          </p>
        </main>
      </form>
    </div>
  )
}
