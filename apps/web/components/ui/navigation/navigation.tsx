import { HStack, Spacer } from "../layout"
import NavLinks from "./nav-links"

export default function Navigation({ origin }: { origin: "app" | "guest" }) {
  return (
    <nav>
      <HStack>
        <h1 className="font-semibold text-4xl self-center">Lyricca</h1>{" "}
        {/* TODO: Replace with logo */}
        <Spacer />
        <NavLinks origin={origin} />
      </HStack>
    </nav>
  )
}
