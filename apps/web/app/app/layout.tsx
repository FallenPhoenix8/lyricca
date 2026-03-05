"use client"
import Navigation from "@/components/ui/navigation/navigation"
import { QueryClient, QueryClientProvider } from "react-query"

const queryClient = new QueryClient()

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="select-none">
        <Navigation origin="app" />
        <section className="px-4 pt-2">{children}</section>
      </main>
    </QueryClientProvider>
  )
}
