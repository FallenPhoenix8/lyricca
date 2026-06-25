"use client"
import { HStack, Spacer } from "../layout"
import NavLinks from "./nav-links"
import { LogoFull } from "../svg/LogoFull"
import Link from "next/link"
import {
  startTransition,
  useLayoutEffect,
  useMemo,
  ViewTransition,
} from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CaretLeftIcon } from "@phosphor-icons/react"

export default function Navigation({ origin }: { origin: "app" | "guest" }) {
  const pathname = usePathname()
  const splittedPathname = pathname.split("/")
  const backButtonPath = [
    splittedPathname[0],
    splittedPathname[1],
    splittedPathname[2],
  ].join("/")
  const isShowBackButton = useMemo(() => {
    return splittedPathname.length >= 4 && origin === "app"
  }, [pathname, origin])

  return (
    <ViewTransition name="navigation">
      <nav className="flex justify-between items-center sticky z-50 top-0 px-2 py-2">
        <div>
          {isShowBackButton && (
            <ViewTransition name="navigation-back-button">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full flex justify-center items-center px-0"
              >
                <Link
                  href={backButtonPath}
                  className="h-full w-full flex justify-center items-center px-3"
                >
                  <CaretLeftIcon className="w-5 h-5" weight="bold" />
                </Link>
              </Button>
            </ViewTransition>
          )}
        </div>

        <HStack className="items-center">
          <Spacer />
          <NavLinks origin={origin} />
        </HStack>
      </nav>
    </ViewTransition>
  )
}
