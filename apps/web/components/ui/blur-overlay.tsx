import { cn } from "@/lib/utils"

export function BlurOverlay(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-2xl -z-20",
        props.className,
      )}
    ></div>
  )
}
