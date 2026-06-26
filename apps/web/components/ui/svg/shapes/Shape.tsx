import {
  getShapePathData,
  type Shape as ShapeType,
} from "@/components/ui/svg/shapes/shapes"

export function Shape({
  shape,
  ...props
}: React.ComponentProps<"svg"> & { shape: ShapeType }) {
  return (
    <ShapeFrame {...props}>
      <path d={getShapePathData(shape)} fill="inherit" />
    </ShapeFrame>
  )
}

export function ShapeFrame({
  groupRef,
  children,
  ...props
}: React.ComponentProps<"svg"> & {
  children: React.ReactNode
  ref?: React.Ref<SVGSVGElement>
  groupRef?: React.Ref<SVGGElement>
}) {
  return (
    <svg
      width="380"
      height="380"
      viewBox="0 0 380 380"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      ref={props.ref}
    >
      <g ref={groupRef}>{children}</g>
    </svg>
  )
}
