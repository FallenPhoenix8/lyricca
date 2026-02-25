import Navigation from "@/components/ui/navigation/navigation"
export default function LandingLayout({
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
