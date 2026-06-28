"use client"
import { TextField } from "@/components/ui/form/TextField"
import { Button } from "@/components/ui/button"
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react"
import { SetStateAction, useEffect, useMemo, useState } from "react"
import { useDebounce } from "use-debounce"
import { ValidationTile } from "@/components/ui/form/inputs/validation-tile"
import { VStack } from "@/components/ui/layout"
import { checkIsPasswordValid } from "@/lib/utils"

export function PasswordInput({
  password,
  setPassword,
  onValidityChange,
}: {
  password: string
  setPassword: React.Dispatch<SetStateAction<string>>
  onValidityChange: React.Dispatch<SetStateAction<boolean>>
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
    onValidityChange(validation.isValid)
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
