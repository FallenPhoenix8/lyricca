import Navigation from "@/components/ui/navigation/navigation"
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navigation origin="guest" />
      {children}
    </>
  )
}
