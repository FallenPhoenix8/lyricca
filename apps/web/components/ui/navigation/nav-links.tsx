"use client"
import AnimatedButtonGroup, {
  ButtonGroupItem,
} from "@/components/ui/animated-button-group"
import { usePathname } from "next/navigation"
import { PlusIcon, BooksIcon, SignInIcon } from "@phosphor-icons/react"
import { Button } from "../button"
import Link from "next/link"

export default function NavLinks({ origin }: { origin: "app" | "guest" }) {
  const pathname = usePathname()
  function getAppLinks(): ButtonGroupItem[] {
    return [
      {
        role: "link",
        label: "Library",
        icon: <BooksIcon className="w-5 h-5" />,
        href: "/app/library",
        isInitialActive: pathname === "/app/library",
      },
      {
        role: "link",
        label: "Add",
        icon: <PlusIcon className="w-5 h-5" weight="bold" />,
        href: "/app/add",
        isInitialActive: pathname === "/app/add",
      },
    ]
  }

  return (
    <div className="pt-2 px-4">
      {origin === "app" && <AnimatedButtonGroup buttons={getAppLinks()} />}
      {origin === "guest" && (
        <Link href="/auth/sign-in">
          <Button tabIndex={-1}>Sign In</Button>
        </Link>
      )}
    </div>
  )
}
