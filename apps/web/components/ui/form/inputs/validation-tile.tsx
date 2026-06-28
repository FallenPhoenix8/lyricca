import { CheckIcon, XIcon } from "@phosphor-icons/react"
import { LoadingSpinner } from "../../loading-spinner"

export function ValidationTile({
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
