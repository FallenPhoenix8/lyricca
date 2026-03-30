import { cn } from "@/lib/utils"

export function VStack(
  props: {
    children: React.ReactNode[] | React.ReactNode
    justifyContent?: "start" | "end" | "center" | "between" | "around"
    alignItems?: "start" | "end" | "center" | "stretch"
    className?: string
    ref?: React.Ref<HTMLDivElement>
  } & React.HTMLAttributes<HTMLDivElement>,
) {
  const { justifyContent, alignItems, ...rest } = props
  return (
    <div
      {...rest}
      className={cn(
        "flex flex-col",
        justifyContent ? `justify-${justifyContent}` : "justify-start",
        alignItems ? `items-${alignItems}` : "items-start",
        props.className,
      )}
      ref={props.ref}
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
  let { justifyContent, alignItems, ...rest } = props

  return (
    <div
      {...rest}
      className={cn(
        "flex flex-row",
        justifyContent ? `justify-${justifyContent}` : "justify-start",
        alignItems ? `items-${alignItems}` : "items-start",
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

export function ZStackGrid(
  props: {
    children: React.ReactNode[] | React.ReactNode
    className?: string
  } & React.HTMLAttributes<HTMLDivElement>,
) {
  return (
    <div {...props} className={`z-stack ${props.className}`}>
      {props.children}
    </div>
  )
}

export function Spacer({ className }: { className?: string }) {
  return <div className={`flex-1 ${className}`}></div>
}
