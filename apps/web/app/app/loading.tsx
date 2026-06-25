import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { LogoFull } from "@/components/ui/svg/LogoFull"

export default function LoadingPage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen gap-2">
      <LogoFull className="w-1/2 fill-primary" />
      <LoadingSpinner className="w-14 h-14" />
    </main>
  )
}
