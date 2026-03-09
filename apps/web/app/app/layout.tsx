"use client"
import Navigation from "@/components/ui/navigation/navigation"
import { SongsProvider } from "@/components/ui/SongsContext"
import { ViewTransition } from "react"
import { QueryClient, QueryClientProvider } from "react-query"
import { NuqsAdapter } from "nuqs/adapters/next"

const queryClient = new QueryClient()

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition default="auto">
      <QueryClientProvider client={queryClient}>
        <SongsProvider>
          <NuqsAdapter>
            <main className="select-none">
              <Navigation origin="app" />
              <section className="px-4 pt-2">{children}</section>
            </main>
          </NuqsAdapter>
        </SongsProvider>
      </QueryClientProvider>
    </ViewTransition>
  )
}
