import { useLayoutEffect, useState } from "react"

/**
 * This hook uses the `matchMedia` API to check if the current window size matches the given query.
 * @param query The media query to check.
 * @returns Whether the current window size matches the given query.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useLayoutEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setMatches(media.matches)

    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [query])

  return matches
}
