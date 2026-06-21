import {
  getShapePathData,
  type Shape as ShapeType,
} from "@/components/ui/svg/shapes/shapes"

export function Shape(
  props: React.ComponentProps<"svg"> & { shape: ShapeType },
) {
  return (
    <svg
      width="380"
      height="380"
      viewBox="0 0 380 380"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d={getShapePathData(props.shape)} fill="inherit" />
    </svg>
  )
}
