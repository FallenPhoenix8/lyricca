import Navigation from "@/components/ui/navigation/navigation"
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="select-none">
      <Navigation origin="app" />
      <section className="px-4 pt-2">{children}</section>
    </main>
  )
}
