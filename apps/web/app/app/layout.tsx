"use client"
import Navigation from "@/components/ui/navigation/navigation"
import { SongsProvider } from "@/components/ui/SongsContext"
import { ViewTransition } from "react"
import { QueryClient, QueryClientProvider } from "react-query"
import { NuqsAdapter } from "nuqs/adapters/next"
import { useDynamicTheme } from "@/lib/client/hook/useDynamicTheme"

const queryClient = new QueryClient()

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useDynamicTheme()
  return (
    <ViewTransition default="auto">
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>
          <SongsProvider>
            <main className="select-none">
              <Navigation origin="app" />
              <section>{children}</section>
            </main>
          </SongsProvider>
        </QueryClientProvider>
      </NuqsAdapter>
    </ViewTransition>
  )
}
