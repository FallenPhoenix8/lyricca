import { HStack, Spacer } from "../layout"
import NavLinks from "./nav-links"
import { LogoFull } from "../svg/LogoFull"
import Link from "next/link"

export default function Navigation({ origin }: { origin: "app" | "guest" }) {
  return (
    <nav>
      <HStack className="items-center px-4 py-2">
        <Link href="/landing">
          <LogoFull className="text-primary h-9" />
        </Link>
        <Spacer />
        <NavLinks origin={origin} />
      </HStack>
    </nav>
  )
}
