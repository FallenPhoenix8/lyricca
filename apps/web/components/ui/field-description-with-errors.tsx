import { cn } from "@/lib/utils"
import { FieldDescription } from "./field"

export function FieldDescriptionWithErrors({
  children,
  errors,
  ...props
}: {
  children: React.ReactNode
  errors: string[]
} & React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <FieldDescription
      {...props}
      className={cn(props.className, "font-semibold")}
    >
      {children}
      {errors.length > 0 &&
        errors.map((error, index) => (
          <>
            <br />
            <span key={`${error}-${index}`} className="text-destructive">
              {error}
              <br />
            </span>
          </>
        ))}
    </FieldDescription>
  )
}
