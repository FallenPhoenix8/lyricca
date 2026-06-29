"use client"

import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"
import { IconName } from "lucide-react/dynamic"
import { ReactNode, startTransition, useState } from "react"
import { SettingsCard, SettingsCardLink } from "./SettingsCard"

export type SettingsCardType =
  | {
      title: ReactNode
      description: ReactNode
      children: ReactNode
      icon: IconName
      variant?: "horizontal" | "vertical"
      className?: string
      isDisabled?: boolean
      isLink: false
    }
  | {
      isLink: true
      href: string
      title: ReactNode
      description?: ReactNode
      icon: IconName
      className?: string
      variant?: "default" | "destructive"
      viewTransitionName?: string
    }

export function SettingsGroup({
  children,
  items,
  isInitiallyOpen = false,
  onOpenChange,
  ...props
}: React.ComponentProps<"div"> & {
  hideText?: React.ReactNode
  showText?: React.ReactNode
  items: SettingsCardType[]
  children: React.ReactNode
  isInitiallyOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
}) {
  const [isOpen, setIsOpen] = useState(isInitiallyOpen)
  function handleClick() {
    startTransition(() => {
      setIsOpen((prev) => {
        onOpenChange?.(!prev)
        return !prev
      })
    })
  }
  return (
    <div
      {...props}
      className={cn("flex flex-col gap-1.5 overflow-visible", props.className)}
    >
      <button
        className={cn(
          "font-bold text-lg flex w-full px-3 py-4 justify-between items-center bg-secondary text-secondary-foreground drop-shadow-xs drop-shadow-black/20 rounded-full",
          isOpen && "rounded-t-xl rounded-b-xs",
        )}
        type="button"
        onClick={handleClick}
      >
        {children}
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </button>
      <div className="flex flex-col gap-1.5">
        {isOpen &&
          items.map((item, index) =>
            item.isLink ? (
              <SettingsCardLink
                key={`settings-card-${index}`}
                cardTitle={item.title}
                description={item.description}
                icon={item.icon}
                href={item.href}
                variant={item.variant}
                className={cn(
                  index === items.length - 1 && "rounded-b-xl pb-4",
                  item.className,
                )}
                viewTransitionName={item.viewTransitionName}
              />
            ) : (
              <SettingsCard
                key={`settings-card-${index}`}
                cardTitle={item.title}
                description={item.description}
                icon={item.icon}
                className={cn(
                  index === items.length - 1 && "rounded-b-xl pb-4",
                  item.className,
                )}
                variant={item.variant}
                isDisabled={item.isDisabled}
              >
                {item.children}
              </SettingsCard>
            ),
          )}
      </div>
    </div>
  )
}
