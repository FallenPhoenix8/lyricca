import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import { DynamicIcon, IconName } from "lucide-react/dynamic"
import Link from "next/link"
import { ReactNode } from "react"
import { ViewTransition } from "react"

/**
 * Represents a universal card in the settings page.
 */
export function SettingsCard({
  cardTitle,
  description,
  children,
  icon,
  className,
  variant = "horizontal",
  isDisabled = false,
  ...props
}: {
  cardTitle: ReactNode
  description: ReactNode
  children: ReactNode
  icon: IconName
  className?: string
  variant?: "horizontal" | "vertical"
  isDisabled?: boolean
} & React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-secondary rounded-xs py-4 px-3 drop-shadow-xs drop-shadow-black/20",
        isDisabled && "opacity-70 cursor-not-allowed",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "flex gap-2 justify-between",
          variant === "horizontal" && "items-center",
          variant === "vertical" && "flex-col",
        )}
      >
        <div className="flex items-center gap-2 h-full">
          <DynamicIcon name={icon} className="h-full aspect-square" />
          <div className="flex-1">
            <h3 className="text-lg font-bold font-heading">{cardTitle}</h3>
            <p className="text-base text-muted-foreground">{description}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

/**
 * Represents a link in the settings page.
 */
export function SettingsCardLink({
  cardTitle,
  icon,
  description,
  href,
  className,
  variant = "default",
  viewTransitionName,
}: {
  cardTitle: ReactNode
  icon: IconName
  href: string
  description?: ReactNode
  className?: string
  variant?: "default" | "destructive"
  viewTransitionName?: string
}) {
  return (
    <ViewTransition name={viewTransitionName}>
      <Link
        className={cn(
          "bg-secondary rounded-xs py-4 px-3 drop-shadow-xs drop-shadow-black/20",
          className,
        )}
        href={href}
      >
        <div className={cn("flex gap-2 justify-between items-center")}>
          <div className="flex items-center gap-2 h-full">
            <DynamicIcon
              name={icon}
              className={cn(
                "h-full aspect-square",
                variant === "destructive" && "text-destructive",
              )}
            />

            <div className="flex-1">
              <h3
                className={cn(
                  "text-lg font-bold font-heading",
                  variant === "destructive" && "text-destructive",
                )}
              >
                {cardTitle}
              </h3>
              {description && (
                <p className="text-base text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          <ChevronRight
            className={cn(
              "h-full aspect-square",
              variant === "destructive" && "text-destructive",
            )}
          />
        </div>
      </Link>
    </ViewTransition>
  )
}
