"use client"
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "react-query"
import type {
  AvailabilityCheckDTO,
  EmailVerificationDTO,
  ErrorResponseDTO,
} from "@shared/ts-types"
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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import BlobSceneNarrow from "@/components/ui/svg/BlobSceneNarrow"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { FieldDescriptionWithErrors } from "@/components/ui/field-description-with-errors"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { cn } from "@/lib/utils"

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
    <div className="flex items-center gap-2 rounded-md px-2 md:px-4 py-2 bg-secondary/20 flex-nowrap mb-1 border border-border">
      {isLoading && (
        // <SpinnerIcon className="w-5 h-5 animate-spin" weight="bold" />
        <LoadingSpinner className="w-5 h-5 shrink-0" />
      )}
      {isValid && !isLoading && (
        <CheckIcon className="w-5 h-5 text-green-500" />
      )}
      {!isValid && !isLoading && (
        <XIcon className="w-5 h-5 text-destructive" weight="bold" />
      )}
      <div className="flex-1">{children}</div>
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
    const isMinimumLength = username.length >= 3 && username.length <= 15
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
      return <LoadingSpinner className="w-5 h-5" />
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

function EmailInput({
  email,
  setEmail,
  onValidityChange,
}: {
  email: string
  setEmail: React.Dispatch<string>
  onValidityChange?: (isValid: boolean) => void
}) {
  const [errors, setErrors] = useState<string[]>([])
  async function sendOTPEmailAction() {
    const trimmedEmail = email.trim()
    if (!trimmedEmail.includes("@")) {
      return
    }
    try {
      return await APIClient.shared.get<EmailVerificationDTO>(
        `/email/verify?email=${trimmedEmail}`,
      )
    } catch (error) {
      console.error("Failed to send OTP email:", error)
    }
  }
  const [emailOTP, setEmailOTP] = useState<string | null>(null)
  const [userOTP, setUserOTP] = useState<string>("")
  const sendOTPEmailMutation = useMutation(sendOTPEmailAction, {
    onSuccess: (response) => {
      setErrors([])
      if (response && !response.ok) {
        console.error("Failed to send OTP email:", response.error)
        if (response.error.statusCode === 409) {
          setErrors((prev) => [...prev, "Email address is already in use."])
        }
        if (response.error.statusCode === 400) {
          setErrors((prev) => [...prev, "Invalid email address."])
        }
        onValidityChange?.(false)
      } else if (response && response.ok) {
        setErrors([])
        setEmailOTP(response.value.otp)
        setIsOTPSent(true)
      }
    },
    onError: (error) => {
      onValidityChange?.(false)
      console.error("Failed to send OTP email:", error)
      errors.push("Failed to send OTP email.")
    },
  })
  const [isOTPSent, setIsOTPSent] = useState(false)

  const validation = useMemo(() => {
    const regex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    const isValid = regex.test(email)
    const isVerified = emailOTP !== null && userOTP === emailOTP
    return {
      isValid,
      isVerified,
    }
  }, [emailOTP, email, userOTP])

  const [countdown, setCountdown] = useState(10)

  function handleSendOTPClick() {
    setIsOTPSent(true)
    sendOTPEmailMutation.mutate()
    setCountdown(9)
  }

  useEffect(() => {
    if (countdown >= 10) return

    if (countdown <= 0) {
      setCountdown(10)
      return
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown])

  useEffect(() => {
    onValidityChange?.((validation.isValid && validation.isVerified) ?? false)
  }, [validation])
  return (
    <VStack>
      <FieldGroup>
        <Field>
          <FieldLabel>Email</FieldLabel>
          <FieldDescriptionWithErrors errors={errors}>
            Enter your email address.
          </FieldDescriptionWithErrors>
          <InputGroup
            className={cn(
              "border-2 border-border rounded-lg h-10 w-full px-3 py-2 text-sm outline-none",
              validation.isValid && "border-success",
              !validation.isValid && "border-destructive",
            )}
          >
            <InputGroupInput
              placeholder="Email"
              required
              type="email"
              onChange={(event) => {
                const target = event.target as HTMLInputElement
                setEmail(target.value)
              }}
              value={email}
              aria-describedby="email-description"
              name="email"
            />
            <InputGroupButton
              disabled={!validation.isValid || countdown !== 10}
              onClick={handleSendOTPClick}
              type="button"
            >
              {countdown !== 10 ? `${countdown}` : "Send"}
            </InputGroupButton>
          </InputGroup>
          <FieldLabel htmlFor="email-verification-code">
            Email Verification Code
          </FieldLabel>
          <InputOTP
            maxLength={6}
            value={userOTP}
            disabled={!isOTPSent}
            onChange={(value) => setUserOTP(value)}
            pattern={REGEXP_ONLY_DIGITS}
            id="email-verification-code"
          >
            <InputOTPGroup
              className={cn(
                "rounded-lg outline-2 outline-offset-1",
                isOTPSent && !validation.isVerified && "outline-destructive",
              )}
            >
              <InputOTPSlot index={0}></InputOTPSlot>
              <InputOTPSlot index={1}></InputOTPSlot>
              <InputOTPSlot index={2}></InputOTPSlot>
              <InputOTPSlot index={3}></InputOTPSlot>
              <InputOTPSlot index={4}></InputOTPSlot>
              <InputOTPSlot index={5}></InputOTPSlot>
            </InputOTPGroup>
          </InputOTP>
        </Field>
        <Field></Field>
      </FieldGroup>
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [isPasswordConfirmationVisible, setIsPasswordConfirmationVisible] =
    useState(false)

  const [debouncedPassword] = useDebounce(password, 500)
  const [debouncedPasswordConfirmation] = useDebounce(passwordConfirmation, 500)

  // * MARK: - Check if password is valid
  // *       -   1. Check if password is strong enough
  // *       -   2. Check if password and password confirmation match

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
        type="button"
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
        type="button"
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
