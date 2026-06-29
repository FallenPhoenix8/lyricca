"use server"
import React, { Suspense, ViewTransition } from "react"
import { ProfileCard } from "@/components/ui/profile-card"
import { ProfileCardSkeleton } from "@/components/ui/profile-card-skeleton"
import { Separator } from "@/components/ui/separator"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { SettingsIsland } from "@/components/ui/settings-island"
import { SettingsItem } from "@/components/ui/settings-item"
import { Settings } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { AppearanceSettingsIsland } from "@/components/ui/appearance-settings-island"
import { SettingsGroup } from "@/components/ui/settings/SettingsGroup"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { AccountSettingsIsland } from "@/components/ui/account-settings-island"
import { Spacer } from "@/components/ui/layout"
import { fetchUserProfile } from "@/lib/data/server-fetch"

export default async function PreferencesPage() {
  const { username, email } = await fetchUserProfile()
  return (
    <ViewTransition enter="replace" exit="replace">
      <section className="px-2">
        {/* <SettingsIsland title="" className="max-w-3xl mx-auto md:p-4 mb-6"> */}

        {/* </SettingsIsland> */}
        <div className="max-w-2xl mx-auto p-1 md:py-10 md:px-4 space-y-4 md:space-y-8">
          <Suspense fallback={<ProfileCardSkeleton />}>
            <ProfileCard />
          </Suspense>
          {/* Section 1: Appearance */}

          <AppearanceSettingsIsland />
          <AccountSettingsIsland username={username} email={email} />
        </div>
      </section>
    </ViewTransition>
  )
}
