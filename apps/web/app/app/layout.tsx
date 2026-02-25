import Navigation from "@/components/ui/navigation/navigation"
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="px-2">
      <Navigation origin="app" />
      {children}
    </main>
  )
}
