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
    <FieldDescription {...props}>
      {children}
      {errors.length > 0 &&
        errors.map((error, index) => (
          <>
            <br />
            <span key={index} className="text-destructive">
              {error}
              <br />
            </span>
          </>
        ))}
    </FieldDescription>
  )
}
