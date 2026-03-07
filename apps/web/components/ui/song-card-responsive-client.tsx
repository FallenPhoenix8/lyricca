import dynamic from "next/dynamic"

/**
 * This component is used to render the `SongCard` component on the client side. It is used to ensure that the view transitions work correctly on the client side.
 *
 */
export const SongCardResponsiveClient = dynamic(() => import("./song-card"), {
  ssr: false,
})
