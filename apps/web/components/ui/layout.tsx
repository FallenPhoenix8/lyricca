export function VStack(
  props: {
    children: React.ReactNode[] | React.ReactNode
    className?: string
  } & React.HTMLAttributes<HTMLDivElement>,
) {
  return (
    <div {...props} className={`flex flex-col ${props.className}`}>
      {props.children}
    </div>
  )
}

export function HStack(
  props: {
    children: React.ReactNode[] | React.ReactNode
    ref?: React.Ref<HTMLDivElement>
  } & React.HTMLAttributes<HTMLDivElement>,
) {
  return (
    <div
      {...props}
      className={`flex flex-row ${props.className}`}
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
