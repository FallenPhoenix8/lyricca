"use client"

import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ZStackGrid } from "./layout"
import { Shape } from "./svg/shapes/Shape"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { useM3Motion } from "@/lib/client/hook/useM3Motion"
import { m3ExpressiveDuration, m3ExpressiveSpring } from "./constants"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

gsap.registerPlugin(useGSAP)

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext],
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api?.off("select", onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative md:overflow-hidden", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "relative flex",
          // orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className,
        )}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn("min-w-0 shrink-0 grow-0 basis-full", className)}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = "ghost",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  useM3Motion()
  const { scrollPrev, canScrollPrev } = useCarousel()
  const [toggled, setToggled] = React.useState(false)
  const shapeRef = React.useRef<SVGSVGElement>(null)

  useGSAP(() => {
    if (!shapeRef.current) return
    gsap.to(shapeRef.current, {
      rotation: "-=360",
      duration: m3ExpressiveDuration.spatial.slow.seconds,
      ease: m3ExpressiveSpring.spatial.slow.gsap,
    })
  }, [toggled])
  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute z-20 size-20 rounded-full",
        "top-1/2 left-10",
        className,
      )}
      disabled={!canScrollPrev}
      onClick={(e) => {
        e.preventDefault()
        if (!canScrollPrev) return
        setToggled((prev) => !prev)
        scrollPrev()
      }}
      {...props}
      style={{
        background: "none !important",
      }}
    >
      <ZStackGrid className="place-items-center">
        <Shape
          shape="6-sided cookie"
          className="fill-primary size-full origin-center"
          ref={shapeRef}
        />
        <span className="sr-only">Previous slide</span>
        <ArrowLeft className="text-primary-foreground size-10 z-10" />
      </ZStackGrid>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = "ghost",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  useM3Motion()
  const { scrollNext, canScrollNext } = useCarousel()
  const [toggled, setToggled] = React.useState(false)
  const shapeRef = React.useRef<SVGSVGElement>(null)

  useGSAP(() => {
    if (!shapeRef.current) return
    gsap.to(shapeRef.current, {
      rotation: "+=360",
      duration: m3ExpressiveDuration.spatial.slow.seconds,
      ease: m3ExpressiveSpring.spatial.slow.gsap,
    })
  }, [toggled])
  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute z-20 size-20 rounded-full",
        "top-1/2 right-10",
        className,
      )}
      disabled={!canScrollNext}
      onClick={(e) => {
        e.preventDefault()
        if (!canScrollNext) return
        setToggled((prev) => !prev)
        scrollNext()
      }}
      {...props}
    >
      <ZStackGrid className="place-items-center">
        <Shape
          shape="6-sided cookie"
          className="fill-primary size-full origin-center"
          ref={shapeRef}
        />
        <span className="sr-only">Next slide</span>
        <ArrowRight className="text-primary-foreground size-10 z-10" />
      </ZStackGrid>
    </Button>
  )
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
