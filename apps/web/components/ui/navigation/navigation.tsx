import { HStack, Spacer } from "../layout"
import NavLinks from "./nav-links"
import { LogoFull } from "../svg/LogoFull"
import Link from "next/link"

export default function Navigation({ origin }: { origin: "app" | "guest" }) {
  return (
    <nav className="sticky z-50 top-0 border-b border-border backdrop-blur-md bg-background/60 backdrop-saturate-200 backdrop-brightness-110 shadow-sm shadow-border/50">
      <HStack className="items-center px-4 py-2">
        <Link href="/landing">
          <LogoFull className="h-9" />
        </Link>
        <Spacer />
        <NavLinks origin={origin} />
      </HStack>
    </nav>
  )
}
