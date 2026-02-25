"use client"
import { useQuery, QueryClient, QueryClientProvider } from "react-query"
import type { AvailabilityCheckDTO, ErrorResponseDTO } from "@shared/ts-types"
import { useActionState, useEffect, useMemo, useState } from "react"
import { signUpAction, State } from "../actions"
import {
  SpinnerIcon,
  CheckIcon,
  XIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@phosphor-icons/react"

import APIClient from "@/lib/data/APIClient"
import { Ok, Result } from "@/types/Result"
import TextField from "@/components/ui/form/TextField"
import { useDebounce, useDebouncedCallback } from "use-debounce"
import clsx from "clsx"
import { HStack, VStack } from "@/components/ui/layout"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import BlobSceneNarrow from "@/components/ui/svg/BlobSceneNarrow"

const queryClient = new QueryClient()

function ValidationTile({
  children,
  isValid,
  isLoading = null,
}: {
  children: React.ReactNode
  isValid: boolean
  isLoading?: boolean | null
}) {
  return (
    <div className="flex items-center gap-2 rounded-md px-4 py-2 bg-secondary/20 flex-nowrap mb-1 border border-border">
      {isLoading && (
        <SpinnerIcon className="w-5 h-5 animate-spin" weight="bold" />
      )}
      {isValid && !isLoading && (
        <CheckIcon className="w-5 h-5 text-green-500" />
      )}
      {!isValid && !isLoading && (
        <XIcon className="w-5 h-5 text-destructive" weight="bold" />
      )}
      <span>{children}</span>
    </div>
  )
}

function UsernameInput({
  username,
  setUsername,
  onValidityChange,
}: {
  username: string
  setUsername: React.Dispatch<string>
  onValidityChange?: (isValid: boolean) => void
}) {
  //   const [username, setUsername] = useState("")
  // * MARK: - Check if username is available
  const [debouncedUsername] = useDebounce(username, 500)

  const { data: usernameAvailability, isLoading } = useQuery<
    Result<AvailabilityCheckDTO, ErrorResponseDTO>
  >(["username-availability", [debouncedUsername]], () => {
    if (debouncedUsername === "") {
      return Ok<AvailabilityCheckDTO>({ available: false, username: "" })
    }
    console.log("Checking availability...")
    return APIClient.shared.get<AvailabilityCheckDTO>(
      `/users/availability?username=${encodeURIComponent(debouncedUsername)}`,
    )
  })
  const validation = useMemo(() => {
    const isAvailable =
      usernameAvailability &&
      usernameAvailability.ok &&
      usernameAvailability.value.available
    const isMinimumLength = username.length >= 3
    const isValid = isAvailable && isMinimumLength
    const isValidForUI = isValid === false && isMinimumLength

    // setIsValid(isValid === undefined ? false : isValid)
    return {
      isAvailable,
      isMinimumLength,
      isValid,
      isValidForUI,
    }
  }, [usernameAvailability])

  function getStateIcon() {
    if (isLoading) {
      return <SpinnerIcon className="w-5 h-5 animate-spin" weight="bold" />
    }
    if (validation.isValid) {
      return <CheckIcon className="w-5 h-5 text-green-500" weight="bold" />
    } else if (!validation.isValidForUI) {
      return <XIcon className="w-5 h-5 text-destructive" weight="bold" />
    } else {
      return <></>
    }
  }

  useEffect(() => {
    onValidityChange?.(validation.isValid ?? false)
  }, [validation.isValid, onValidityChange])

  return (
    <VStack>
      <TextField
        label="Username"
        name="username"
        description={{
          error: "",
          default: "",
        }}
        placeholder="Username"
        value={username}
        onChange={(event) => {
          setUsername(event.target.value)
        }}
        required
        addonAlignment="inline-end"
        addon={getStateIcon()}
        className={clsx({
          "border-green-500": validation.isValidForUI,
          "border-destructive": !validation.isValidForUI,
        })}
        isInvalid={!validation.isValidForUI}
      />

      <ValidationTile
        isValid={validation.isAvailable ?? false}
        isLoading={isLoading}
      >
        Username is available
      </ValidationTile>
      <ValidationTile isValid={validation.isMinimumLength ?? false}>
        Username must be at least 3 characters long
      </ValidationTile>
    </VStack>
  )
}

function checkIsPasswordValid(password: string, confirmPassword: string) {
  const isLongEnough = password.length >= 8
  const hasUppercase: boolean = password.match(/[A-Z]/) !== null
  const hasLowercase = password.match(/[a-z]/) !== null
  const hasNumber = password.match(/[0-9]/) !== null
  const hasSpecialCharacter = password.match(/[^A-Za-z0-9]/) !== null
  const isMatch = password === confirmPassword && password !== ""
  const isValid =
    isLongEnough &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialCharacter

  return {
    isLongEnough,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialCharacter,
    isMatch,
    isValid,
  }
}
function PasswordInput({
  password,
  setPassword,
  onValidityChange,
}: {
  password: string
  setPassword: React.Dispatch<string>
  onValidityChange?: (isValid: boolean) => void
}) {
  //   const [password, setPassword] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [isPasswordConfirmationVisible, setIsPasswordConfirmationVisible] =
    useState(false)

  const [debouncedPassword] = useDebounce(password, 500)
  const [debouncedPasswordConfirmation] = useDebounce(passwordConfirmation, 500)

  // * MARK: - Check if password is valid
  // 1. Check if password is strong enough
  // 2. Check if password and password confirmation match

  const validation = useMemo(() => {
    return checkIsPasswordValid(
      debouncedPassword,
      debouncedPasswordConfirmation,
    )
  }, [debouncedPassword, debouncedPasswordConfirmation])

  function PasswordVisibilityButton() {
    return (
      <Button
        variant="outline"
        size="icon-xs"
        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
      >
        {isPasswordVisible ? (
          <EyeIcon className="w-5 h-5" weight="bold" />
        ) : (
          <EyeSlashIcon className="w-5 h-5" weight="bold" />
        )}
      </Button>
    )
  }

  function ConfirmPasswordVisibilityButton() {
    return (
      <Button
        variant="outline"
        size="icon-xs"
        onClick={() =>
          setIsPasswordConfirmationVisible(!isPasswordConfirmationVisible)
        }
      >
        {isPasswordConfirmationVisible ? (
          <EyeIcon className="w-5 h-5" weight="bold" />
        ) : (
          <EyeSlashIcon className="w-5 h-5" weight="bold" />
        )}
      </Button>
    )
  }

  useEffect(() => {
    onValidityChange?.(validation.isValid ?? false)
  }, [validation.isValid, onValidityChange])

  return (
    <VStack>
      <TextField
        label="Password"
        name="password"
        type={isPasswordVisible ? "text" : "password"}
        placeholder="Password"
        addon={<PasswordVisibilityButton />}
        addonAlignment="inline-end"
        isInvalid={validation.isMatch === false}
        required
        onChange={(event) => {
          setPassword(event.target.value)
        }}
        value={password}
      />
      <TextField
        name="passwordConfirmation"
        type={isPasswordConfirmationVisible ? "text" : "password"}
        placeholder="Password Confirmation"
        addon={<ConfirmPasswordVisibilityButton />}
        addonAlignment="inline-end"
        isInvalid={validation.isMatch === false}
        required
        onChange={(event) => {
          setPasswordConfirmation(event.target.value)
        }}
        value={passwordConfirmation}
      />
      <ValidationTile isValid={validation.hasLowercase}>
        Password must contain at least one lowercase letter
      </ValidationTile>
      <ValidationTile isValid={validation.hasUppercase}>
        Password must contain at least one uppercase letter
      </ValidationTile>
      <ValidationTile isValid={validation.hasNumber}>
        Password must contain at least one number
      </ValidationTile>
      <ValidationTile isValid={validation.hasSpecialCharacter}>
        Password must contain at least one special character
      </ValidationTile>
      <ValidationTile isValid={validation.isLongEnough}>
        Password must be at least 8 characters long
      </ValidationTile>
      <ValidationTile isValid={validation.isMatch}>
        Passwords must match
      </ValidationTile>
    </VStack>
  )
}

export default function SignUpPage() {
  const [isPending, setIsPending] = useState(false)
  const initialState: State = {
    errors: {},
    message: null,
  }

  const [username, setUsername] = useState("")
  const [isValidUsername, setIsValidUsername] = useState(false)
  const [password, setPassword] = useState("")
  const [isValidPassword, setIsValidPassword] = useState(false)

  const [state, formAction] = useActionState(signUpAction, initialState)
  return (
    <QueryClientProvider client={queryClient}>
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
          <BlobSceneNarrow className="h-full shrink transform-[scaleX(-1)] rounded-lg hidden lg:block border-r-2 border-border" />
          <main className="flex flex-col gap-4 max-w-xl p-10 lg:p-4">
            <h2 className="text-3xl font-semibold">Sign Up</h2>
            <p>Sign up to create an account and start using Lyricca!</p>

            <UsernameInput
              username={username}
              setUsername={setUsername}
              onValidityChange={setIsValidUsername}
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
              disabled={!isValidPassword || !isValidUsername || isPending}
            >
              {isPending && (
                <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />
              )}
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
