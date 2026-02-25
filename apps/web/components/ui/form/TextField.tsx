import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../input-group"
import clsx from "clsx"

export default function TextField({
  label,
  description,
  name,
  placeholder,
  addon,
  className,
  onChange,
  value,
  addonAlignment = "inline-start",
  isInvalid = false,
  type = "text",
  required = false,
}: {
  label?: string
  description?: {
    default: string | React.ReactNode
    error: string
  }
  name: string
  placeholder: string
  isInvalid?: boolean
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  value?: string
  addonAlignment?: "inline-start" | "inline-end"
  className?: string
  type?: "text" | "password"
  addon?: React.ReactNode
  required?: boolean
}) {
  const inputId = `input-${name}`
  return (
    <Field className={clsx("max-w-md", className)}>
      {label && <FieldLabel htmlFor={inputId}>{label}</FieldLabel>}
      <InputGroup
        className={clsx({
          "border-destructive": isInvalid,
        })}
      >
        <InputGroupInput
          id={inputId}
          name={name}
          placeholder={placeholder}
          type={type}
          onChange={onChange}
          value={value}
          required={required}
        />
        {addon && (
          <InputGroupAddon align={addonAlignment}>{addon}</InputGroupAddon>
        )}
      </InputGroup>
      <FieldDescription>
        {isInvalid && (
          <span className="text-destructive">
            {description && description.error}
          </span>
        )}
        {!isInvalid && (
          <span className="text-muted-foreground">
            {description && description.default}
          </span>
        )}
      </FieldDescription>
    </Field>
  )
}
