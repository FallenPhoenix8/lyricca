"use client"
import { TextField } from "@/components/ui/form/TextField"
import { SetStateAction, useEffect, useMemo, useState } from "react"
import { useDebounce } from "use-debounce"
import { useMutation, useQuery } from "react-query"
import {
  AvailabilityCheckDTO,
  EmailVerificationDTO,
  ErrorResponseDTO,
} from "@shared/ts-types"
import { Ok, Result } from "@/types/Result"
import APIClient from "@/lib/data/APIClient"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ValidationTile } from "@/components/ui/form/inputs/validation-tile"
import { VStack } from "@/components/ui/layout"
import { CheckIcon, XIcon } from "@phosphor-icons/react"
import clsx from "clsx"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
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
import { FieldDescriptionWithErrors } from "../../field-description-with-errors"

export function EmailInput({
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
    onSuccess: (response: any) => {
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
    onError: (error: any) => {
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
