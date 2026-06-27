import { cn } from "@/lib/utils"
import { MorphingShapes } from "./morphing-shapes"

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-secondary w-8 h-8 p-1 rounded-full",
        className,
      )}
    >
      <MorphingShapes className="h-full w-full fill-secondary-foreground" />
    </div>
  )
}
