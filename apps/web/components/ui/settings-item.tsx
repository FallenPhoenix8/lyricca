import { Label } from "./label"
import { cn } from "@/lib/utils"

export function SettingsItem({
  children,
  className,
  label,
  description,
  ...props
}: {
  children: React.ReactNode
  label: React.ReactNode
  description?: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-2 md:px-6 md:py-4 hover:bg-muted/50 transition-colors",
        className,
      )}
      {...props}
    >
      <div className="space-y-0.5">
        <Label className="text-base">{label}</Label>
        <p className="text-sm text-muted-foreground hidden md:block">
          {description}
        </p>
      </div>
      {children}
    </div>
  )
}
