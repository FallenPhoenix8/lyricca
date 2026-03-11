import React, { Suspense, ViewTransition } from "react"
import { ProfileCard } from "@/components/ui/profile-card"
import { ProfileCardSkeleton } from "@/components/ui/profile-card-skeleton"
import { Switch } from "@/components/ui/switch"
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

// TODO: Implement appearance settings
export default function PreferencesPage() {
  return (
    <ViewTransition default="auto">
      <Breadcrumb className="my-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Preferences</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <SettingsIsland title="" className="max-w-3xl mx-auto md:p-4 mb-6">
        <Suspense fallback={<ProfileCardSkeleton />}>
          <ProfileCard />
        </Suspense>
      </SettingsIsland>
      <div className="max-w-2xl mx-auto p-1 md:py-10 md:px-4 space-y-4 md:space-y-8">
        {/* Section 1: Appearance */}

        <SettingsIsland title="Appearance">
          {/* Row 1: Theme Selection */}
          <SettingsItem
            label="Theme"
            description="Select your preferred interface style."
          >
            <NativeSelect defaultValue="system">
              <NativeSelectOption value="light">Light</NativeSelectOption>
              <NativeSelectOption value="dark">Dark</NativeSelectOption>
              <NativeSelectOption value="system">System</NativeSelectOption>
            </NativeSelect>
          </SettingsItem>

          <Separator />

          {/* Row 2: Animations Toggle */}
          <SettingsItem
            label="Accent Color"
            description="Choose your preferred accent color."
          >
            <NativeSelect defaultValue="rose">
              <NativeSelectOption value="neutral">Neutral</NativeSelectOption>
              <NativeSelectOption value="rose">Rose</NativeSelectOption>
              <NativeSelectOption value="violet">Violet</NativeSelectOption>
              <NativeSelectOption value="blue">Blue</NativeSelectOption>
              <NativeSelectOption value="green">Green</NativeSelectOption>
            </NativeSelect>
          </SettingsItem>
        </SettingsIsland>

        <SettingsIsland title="Account">
          <SettingsItem
            label="Account"
            description="Manage your account settings."
          >
            TODO
          </SettingsItem>
        </SettingsIsland>
      </div>
    </ViewTransition>
  )
}
