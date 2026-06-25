"use client"
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { useWebHaptics } from "web-haptics/react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { m3ExpressiveDuration, m3ExpressiveSpring } from "./constants"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { useM3Motion } from "@/lib/client/hook/useM3Motion"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer disabled:cursor-not-allowed drop-shadow-sm drop-shadow-background/50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

gsap.registerPlugin(useGSAP)
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  useM3Motion()

  const buttonRef = React.useRef<HTMLButtonElement | null>(null)
  const [isPressed, setIsPressed] = useState(false)
  function startPress() {
    setIsPressed(true)
  }
  function endPress() {
    setIsPressed(false)
  }
  const Comp = asChild ? Slot.Root : "button"
  const { trigger } = useWebHaptics({ debug: true })

  React.useLayoutEffect(() => {
    gsap.to(buttonRef.current, {
      scale: isPressed ? 0.9 : 1,
      duration: m3ExpressiveDuration.spatial.fast.seconds,
      ease: m3ExpressiveSpring.spatial.fast.gsap,
    })
  }, [isPressed])

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(
        buttonVariants({ variant, size, className }),
        m3ExpressiveDuration.effect.fast.className,
        m3ExpressiveSpring.effect.fast.className,
        isPressed && "bg-primary text-primary-foreground opacity-90",
      )}
      {...props}
      onClick={(event) => {
        trigger([{ duration: 15 }], { intensity: 0.4 }) // Trigger light haptic feedback on click
        props.onClick?.(event)
      }}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onMouseDown={startPress}
      onMouseUp={endPress}
      ref={buttonRef}
    />
  )
}

export { Button, buttonVariants }
