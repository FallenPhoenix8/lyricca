"use client"
import {
  LinkItem,
  NavigationLinkGroup,
} from "@/components/ui/animated-button-group"
import { usePathname } from "next/navigation"
import { PlusIcon, BooksIcon, GearSixIcon } from "@phosphor-icons/react"
import { Button } from "../button"
import Link from "next/link"
import { ViewTransition } from "react"

export default function NavLinks({ origin }: { origin: "app" | "guest" }) {
  const pathname = usePathname()
  function getAppLinks(): LinkItem[] {
    return [
      {
        label: "Settings",
        icon: <GearSixIcon className="w-5 h-5" />,
        href: "/app/preferences",
        isInitialActive: pathname === "/app/preferences",
      },
      {
        label: "Library",
        icon: <BooksIcon className="w-5 h-5" />,
        href: "/app/library",
        isInitialActive: pathname === "/app/library",
      },
      {
        label: "Add",
        icon: <PlusIcon className="w-5 h-5" weight="bold" />,
        href: "/app/add",
        isInitialActive: pathname === "/app/add",
      },
    ]
  }

  return (
    <ViewTransition name="nav-links">
      <div className="z-150">
        {origin === "app" && <NavigationLinkGroup buttons={getAppLinks()} />}
        {origin === "guest" && (
          <Link href="/auth/sign-in">
            <Button tabIndex={-1}>Sign In</Button>
          </Link>
        )}
      </div>
    </ViewTransition>
  )
}
