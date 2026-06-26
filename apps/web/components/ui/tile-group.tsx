import { createRef, useState } from "react"
import { Tile } from "./tile"
import { IconName } from "lucide-react/dynamic"
import { cn } from "@/lib/utils"
import { useGSAP } from "@gsap/react"
import { useM3Motion } from "@/lib/client/hook/useM3Motion"
import gsap from "gsap"
import { m3ExpressiveDuration, m3ExpressiveSpring } from "./constants"

export type TileGroupItem = {
  icon: IconName
  activeIcon?: IconName
  isActive: boolean
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  isCompact?: boolean
  children: React.ReactNode
}

gsap.registerPlugin(useGSAP)
export function TileGroup({
  tiles,
  ...props
}: React.ComponentProps<"div"> & {
  tiles: TileGroupItem[]
}) {
  useM3Motion()
  const references = tiles.map(() => createRef<HTMLButtonElement>())
  const [clickedIndex, setClickedIndex] = useState<number | null>(null)

  /**
   * Finds which indices are adjacent to the clicked index.
   * @param index Index of current tile
   * @returns [neighboringIndex1, neighboringIndex2]  or [neighboringIndex1, null] or [null, neighboringIndex2]
   */
  function getNeighboringIndices(index: number): (number | null)[] {
    const neighboringIndices: (number | null)[] = [null, null]
    if (index > 0) {
      neighboringIndices[0] = index - 1
    }
    if (index < tiles.length - 1) {
      neighboringIndices[1] = index + 1
    }
    return neighboringIndices
  }

  function handleTileClick(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    index: number,
  ) {
    event.preventDefault()
    setClickedIndex(index)
    setTimeout(() => setClickedIndex(null), 100)
    tiles[index].onClick?.(event)
  }

  useGSAP(() => {
    if (clickedIndex === null) return
    for (const reference of references) {
      if (!reference.current) return
    }

    const neighboringIndices = getNeighboringIndices(clickedIndex)
    const duration = m3ExpressiveDuration.spatial.default.seconds / 2
    const ease = m3ExpressiveSpring.spatial.fast.gsap
    const clickedTileTimeline = gsap.timeline({
      defaults: {
        ease,
      },
    })

    const clickedTile = references[clickedIndex].current!
    const clickedTileWidth = clickedTile.getBoundingClientRect().width
    const clickScale = 1.1
    const neighborScale = 0.98
    const translationMultiplier = 0.02
    clickedTileTimeline.to(clickedTile, {
      scale: clickScale,
      translateY: "-5%",
      transformOrigin: "center",
      duration,
    })
    clickedTileTimeline.to(clickedTile, {
      scale: 1,
      translateY: "0",
      transformOrigin: "center",
      duration,
      delay: duration,
    })

    if (neighboringIndices[0] !== null) {
      const firstNeighborTimeline = gsap.timeline({
        defaults: {
          ease,
        },
      })
      const elem = references[neighboringIndices[0]].current!
      const borderRadius = elem.style.borderRadius
      firstNeighborTimeline.to(elem, {
        delay: duration / 2,
        scaleX: neighborScale,
        translateX: -1 * clickedTileWidth * translationMultiplier,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        transformOrigin: "left",
        duration,
      })
      firstNeighborTimeline.to(elem, {
        scaleX: 1,
        translateX: "0",
        translateY: "0",
        borderTopRightRadius: borderRadius,
        borderBottomRightRadius: borderRadius,
        transformOrigin: "left",
        duration,
        delay: duration,
      })
    }
    if (neighboringIndices[1] !== null) {
      const secondNeighborTimeline = gsap.timeline({
        defaults: {
          ease,
        },
      })
      const elem = references[neighboringIndices[1]].current!
      const borderRadius = elem.style.borderRadius
      secondNeighborTimeline.to(elem, {
        delay: duration / 2,
        scaleX: neighborScale,
        translateX: clickedTileWidth * translationMultiplier,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        transformOrigin: "right",
        duration,
      })
      secondNeighborTimeline.to(elem, {
        scaleX: 1,
        translateX: "0",
        borderTopLeftRadius: borderRadius,
        borderBottomLeftRadius: borderRadius,
        transformOrigin: "right",
        duration,
        delay: duration,
      })
    }
  }, [clickedIndex])
  return (
    <div
      {...props}
      className={cn("flex flex-wrap gap-1 overflow-show", props.className)}
    >
      {tiles.map((tile, index) => (
        <Tile
          key={index}
          ref={references[index]}
          icon={tile.icon}
          activeIcon={tile.activeIcon}
          isActive={tile.isActive}
          setIsActive={tile.setIsActive}
          isCompact={tile.isCompact}
          children={tile.children}
          onClick={(event) => {
            handleTileClick(event, index)
          }}
        />
      ))}
    </div>
  )
}
