import Navigation from "@/components/ui/navigation/navigation"
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <Navigation origin="app" />
      {children}
    </main>
  )
}
