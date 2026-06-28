import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function checkIsPasswordValid(
  password: string,
  confirmPassword: string,
) {
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
    isMatch &&
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
