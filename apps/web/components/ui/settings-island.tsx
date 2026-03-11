import { cn } from "@/lib/utils"

export function SettingsIsland(
  props: {
    children: React.ReactNode
    title: React.ReactNode
  } & React.HTMLAttributes<HTMLDivElement>,
) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground mb-1 ml-1">
        {props.title}
      </h2>
      <div
        {...props}
        className={cn(
          "rounded-4xl md:rounded-xl squircle bg-card text-card-foreground shadow-md shadow-card/50 border-2 border-card-foreground/10 w-full",
          props.className,
        )}
      >
        {props.children}
      </div>
    </div>
  )
}
