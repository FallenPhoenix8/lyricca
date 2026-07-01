import { Button } from "@/components/ui/button"
import { ZStackGrid } from "@/components/ui/layout"
import { Shape } from "@/components/ui/svg/shapes/Shape"
import { Home } from "lucide-react"
import Link from "next/link"

export default function NotFoundPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Link
        className="z-stack cursor-pointer size-1/4 fill-secondary -mr-8 md:-mr-16 mt-10 place-items-center"
        href="/"
      >
        <Shape shape="6-sided cookie" className="size-full" />
        <figure className="font-heading text-text-secondary-foreground text-3xl md:text-5xl">
          4
        </figure>
      </Link>
      <Link
        className="z-stack cursor-pointer size-1/4 fill-primary z-10 place-items-center"
        href="/"
      >
        <Shape className="size-full" shape="Circle" />
      </Link>
      <Link
        className="z-stack cursor-pointer size-1/4 fill-secondary -ml-8 md:-ml-16 mt-10 place-items-center"
        href="/"
      >
        <Shape shape="6-sided cookie" className="size-full" />
        <figure className="font-heading text-text-secondary-foreground text-3xl md:text-5xl">
          4
        </figure>
      </Link>
    </div>
  )
}
