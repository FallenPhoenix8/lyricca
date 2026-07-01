"use client"
import { Shield } from "lucide-react"
import { SettingsGroup } from "./settings/SettingsGroup"
import { useQueryState } from "nuqs"

export function AccountSettingsIsland(props: {
  username: string
  email: string
}) {
  const [isOpen, setIsOpen] = useQueryState("security-group-state", {
    defaultValue: "closed",
  })
  return (
    <SettingsGroup
      items={[
        {
          isLink: true,
          href: `/app/preferences/edit/username?username=${props.username}`,
          title: "Change Username",
          icon: "user",
          className: "w-full",
          viewTransitionName: "edit-username",
        },
        {
          isLink: true,
          href: `/app/preferences/edit/email?email=${props.email}`,
          title: "Change Email",
          icon: "mail",
          className: "w-full",
          viewTransitionName: "edit-email",
        },
        {
          isLink: true,
          href: "/app/preferences/edit/password",
          title: "Change Password",
          icon: "key-round",
          className: "w-full",
          viewTransitionName: "edit-password",
        },
        {
          isLink: true,
          href: "/auth/sign-out",
          title: <>Sign Out</>,
          icon: "log-out",
          className: "w-full",
          variant: "destructive",
        },
      ]}
      isInitiallyOpen={isOpen === "open"}
      onOpenChange={(isOpen) => setIsOpen(isOpen ? "open" : "closed")}
    >
      <div className="flex gap-2 items-center">
        <Shield className="h-full aspect-square" />
        <div>Security</div>
      </div>
    </SettingsGroup>
  )
}
