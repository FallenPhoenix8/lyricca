import { Suspense, ViewTransition } from "react"
import { ProfileCard } from "@/components/ui/profile-card"

export default function PreferencesPage() {
  return (
    <ViewTransition default="auto">
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <ProfileCard />
        </Suspense>
      </div>
    </ViewTransition>
  )
}
