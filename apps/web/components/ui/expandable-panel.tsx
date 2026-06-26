import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"
import React, { startTransition, useState } from "react"
import { m3ExpressiveDuration } from "./constants"

export function ExpandablePanel({
  showText = "Show",
  hideText = "Hide",
  ...props
}: React.ComponentProps<"div"> & {
  showText?: React.ReactNode
  hideText?: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  function handleClick() {
    startTransition(() => {
      setIsOpen((prev) => !prev)
    })
  }
  return (
    <div
      {...props}
      className={cn("flex flex-col gap-2 overflow-visible", props.className)}
    >
      <button
        className={cn(
          "font-bold text-lg flex w-full px-3 py-4 justify-between items-center bg-popover  text-popover-foreground transition-[outline] drop-shadow-sm drop-shadow-black/50 rounded-full hover:outline-4 outline-offset-2 outline-popover",
          m3ExpressiveDuration.effect.fast.className,
          m3ExpressiveDuration.effect.default.className,
          isOpen && "rounded-t-xl rounded-b-sm",
        )}
        type="button"
        onClick={handleClick}
      >
        <span>{isOpen ? hideText : showText}</span>
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </button>

      {isOpen && props.children}
    </div>
  )
}
