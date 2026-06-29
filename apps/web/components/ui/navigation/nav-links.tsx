"use client"
import {
  LinkItem,
  NavigationLinkGroup,
} from "@/components/ui/animated-button-group"
import { usePathname } from "next/navigation"
import {
  PlusIcon,
  BooksIcon,
  GearSixIcon,
  CaretLeftIcon,
} from "@phosphor-icons/react"
import { Button } from "../button"
import Link from "next/link"
import { useMemo, ViewTransition } from "react"
import { useQueryState } from "nuqs"
import { cn } from "@/lib/utils"
import { Spacer } from "../layout"

export default function NavLinks({ origin }: { origin: "app" | "guest" }) {
  const pathname = usePathname()
  function getAppLinks(): LinkItem[] {
    return [
      {
        label: "Settings",
        icon: "settings",
        href: "/app/preferences",
        isInitialActive: pathname === "/app/preferences",
      },
      {
        label: "Library",
        icon: "library-big",
        href: "/app/library",
        isInitialActive: pathname === "/app/library",
      },
      {
        label: "Add",
        icon: "plus",
        href: "/app/add",
        isInitialActive: pathname === "/app/add",
      },
    ]
  }

  const splittedPathname = pathname.split("/")
  let backButtonPath = [
    splittedPathname[0],
    splittedPathname[1],
    splittedPathname[2],
  ].join("/")

  const isChildPath = useMemo(() => {
    return splittedPathname.length >= 4 && origin === "app"
  }, [pathname, origin])
  const isPreferencesEditPath = useMemo(() => {
    return pathname.startsWith("/app/preferences/edit")
  }, [pathname])
  if (isPreferencesEditPath) {
    backButtonPath += "?security-group-state=open"
  }
  const [pageTitle] = useQueryState("title", { defaultValue: "" })

  return (
    <ViewTransition name="nav-links">
      <div className="flex gap-2 z-150 w-full">
        {origin === "app" && (
          <>
            {!isChildPath && <Spacer />}
            {isChildPath && (
              <ViewTransition name="navigation-back-button">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full flex justify-center items-center px-0"
                >
                  <Link
                    href={backButtonPath}
                    className="h-full w-full flex justify-center items-center"
                  >
                    <CaretLeftIcon className="w-5 h-5" weight="bold" />
                  </Link>
                </Button>
              </ViewTransition>
            )}
            {isChildPath && (
              <ViewTransition
                enter="replace-controls-new"
                exit="replace-controls-new"
              >
                <div
                  className={cn(
                    "align-center font-bold border-0 rounded-xs transition-[border-color, border-radius, border-width, outline] outline-0 bg-secondary rounded-md w-full drop-shadow-sm drop-shadow-black/50 px-2 overflow-hidden text-ellipsis text-nowrap leading-9 max-w-fit",
                  )}
                >
                  {pageTitle}
                </div>
              </ViewTransition>
            )}
            {isChildPath && <Spacer />}
            <NavigationLinkGroup
              buttons={getAppLinks()}
              className="justify-self-end"
            />
          </>
        )}
        {origin === "guest" && (
          <Link href="/auth/sign-in">
            <Button tabIndex={-1}>Sign In</Button>
          </Link>
        )}
      </div>
    </ViewTransition>
  )
}
