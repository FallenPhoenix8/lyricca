"use client"

import { TextField } from "@/components/ui/form/TextField"
import { SetStateAction, useEffect, useMemo } from "react"
import { useDebounce } from "use-debounce"
import { useQuery } from "react-query"
import { AvailabilityCheckDTO, ErrorResponseDTO } from "@shared/ts-types"
import { Ok, Result } from "@/types/Result"
import APIClient from "@/lib/data/APIClient"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ValidationTile } from "@/components/ui/form/inputs/validation-tile"
import { VStack } from "@/components/ui/layout"
import { CheckIcon, XIcon } from "@phosphor-icons/react"
import clsx from "clsx"

export function UsernameInput({
  username,
  setUsername,
  onValidityChange,
}: {
  username: string
  setUsername: React.Dispatch<SetStateAction<string>>
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
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    const isEmail = emailRegex.test(username)
    const isAvailable =
      !isEmail &&
      usernameAvailability &&
      usernameAvailability.ok &&
      usernameAvailability.value.available
    const isMinimumLength = username.length >= 3 && username.length <= 15
    const isValid = isAvailable && isMinimumLength

    return {
      isAvailable,
      isMinimumLength,
      isValid,
    }
  }, [usernameAvailability])

  function getStateIcon() {
    if (isLoading) {
      return <LoadingSpinner className="w-5 h-5" />
    }
    if (validation.isValid) {
      return <CheckIcon className="w-5 h-5 text-green-500" weight="bold" />
    } else if (!validation.isValid) {
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
          "border-green-500": validation.isValid,
          "border-destructive": !validation.isValid,
        })}
        isInvalid={!validation.isValid}
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
