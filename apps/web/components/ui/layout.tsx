import { cn } from "@/lib/utils"

export function VStack(
  props: {
    children: React.ReactNode[] | React.ReactNode
    justifyContent?: "start" | "end" | "center" | "between" | "around"
    alignItems?: "start" | "end" | "center" | "stretch"
    className?: string
  } & React.HTMLAttributes<HTMLDivElement>,
) {
  return (
    <div
      {...props}
      className={cn(
        "flex flex-col",
        props.justifyContent
          ? `justify-${props.justifyContent}`
          : "justify-start",
        props.alignItems ? `items-${props.alignItems}` : "items-start",
        props.className,
      )}
    >
      {props.children}
    </div>
  )
}

export function HStack(
  props: {
    children: React.ReactNode[] | React.ReactNode
    justifyContent?: "start" | "end" | "center" | "between" | "around"
    alignItems?: "start" | "end" | "center" | "stretch"
    ref?: React.Ref<HTMLDivElement>
  } & React.HTMLAttributes<HTMLDivElement>,
) {
  return (
    <div
      {...props}
      className={cn(
        "flex flex-row",
        props.justifyContent
          ? `justify-${props.justifyContent}`
          : "justify-start",
        props.alignItems ? `items-${props.alignItems}` : "items-start",
        props.className,
      )}
      ref={props.ref}
    >
      {props.children}
    </div>
  )
}

export function ZStack(
  props: {
    children: React.ReactNode[] | React.ReactNode
    className?: string
  } & React.HTMLAttributes<HTMLDivElement>,
) {
  return (
    <div {...props} className={`relative ${props.className}`}>
      {props.children}
    </div>
  )
}

export function Spacer({ className }: { className?: string }) {
  return <div className={`flex-1 ${className}`}></div>
}
