"use client"
import { cn } from "@/lib/utils"
import { ZStackGrid } from "../layout"
import { LayeredWavesTop } from "./layered-waves-top"
import { LowPolyGrid } from "./low-poly-grid"
import { overlayBlurClassName } from "../blur-overlay"
import { Button } from "../button"
import { CoffeeIcon, GithubLogoIcon } from "@phosphor-icons/react"
import { ReactNode } from "react"
import { Coffee } from "lucide-react"

function Item(props: {
  title: ReactNode
  description: ReactNode
  children: ReactNode
  href: string
}) {
  return (
    <div className="w-full md:w-auto space-y-2 border-4 border-border px-4 py-6 rounded-lg drop-shadow-sm drop-shadow-background/50">
      <h3 className="text-2xl font-heading font-extrabold">{props.title}</h3>
      <p className="text-lg font-semibold opacity-80">{props.description}</p>
      <a href={props.href}>
        <Button variant="outline" size="lg">
          {props.children}
        </Button>
      </a>
    </div>
  )
}

export function Links() {
  return (
    <section id="links">
      <LayeredWavesTop />
      <ZStackGrid className="overflow-hidden">
        <LowPolyGrid className="h-full" />
        <div
          className={cn(
            "mx-2 md:mx-4 lg:mx-auto max-w-4xl p-10 rounded-2xl my-60",
            overlayBlurClassName,
          )}
        >
          <h3 className="text-4xl font-heading font-extrabold">Useful Links</h3>
          <div className="flex md:flex-row flex-col gap-4 mt-6">
            <Item
              title="GitHub Repository"
              description="You can view the source code below"
              href="https://github.com/FallenPhoenix8/lyricca"
            >
              <>
                <GithubLogoIcon className="w-5 h-5" weight="bold" /> GitHub
                Repository
              </>
            </Item>
            <Item
              title="Support the Project"
              description="If you like Lyricca, consider supporting me by buying me a coffee!"
              href="https://www.buymeacoffee.com/fallenphoenix"
            >
              <Coffee className="w-5 h-5" strokeWidth="2px" /> Buy Me a Coffee
            </Item>
          </div>
        </div>
      </ZStackGrid>
    </section>
  )
}
