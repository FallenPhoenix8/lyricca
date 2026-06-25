import { cn } from "@/lib/utils"

export const overlayBlurClassName = "bg-background/80 backdrop-blur-2xl"
export function BlurOverlay(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "fixed inset-0 -z-20",
        overlayBlurClassName,
        props.className,
      )}
    ></div>
  )
}
