import { LayeredWaves } from "./layered-waves"

export function Hero() {
  return (
    <header className="mt-44 h-full">
      <h1 className="font-extrabold text-6xl md:text-9xl text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/50 leading-20 md:leading-40 w-fit font-heading md:px-4 px-2">
        Lyricca.
      </h1>
      <h2 className="font-bold text-lg md:text-3xl text-primary/50 w-fit font-heading md:px-4 px-2">
        The only place to store your lyrics you will ever need.
      </h2>
      <LayeredWaves />
    </header>
  )
}
