"use server"
import { Suspense, ViewTransition } from "react"
import { ProfileCard } from "@/components/ui/profile-card"
import { ProfileCardSkeleton } from "@/components/ui/profile-card-skeleton"
import { AppearanceSettingsIsland } from "@/components/ui/appearance-settings-island"
import { AccountSettingsIsland } from "@/components/ui/account-settings-island"
import { fetchUserProfile } from "@/lib/data/server-fetch"

export default async function PreferencesPage() {
  const { username, email } = await fetchUserProfile()
  return (
    <ViewTransition enter="replace" exit="replace">
      <section className="px-2">
        <div className="max-w-2xl mx-auto p-1 md:py-10 md:px-4 space-y-4 md:space-y-8">
          <Suspense fallback={<ProfileCardSkeleton />}>
            <ProfileCard />
          </Suspense>
          <AppearanceSettingsIsland />
          <AccountSettingsIsland username={username} email={email} />
        </div>
      </section>
    </ViewTransition>
  )
}
