export function Circle({
  className,
  ref,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 380 380"
      // Force the SVG to allow its children (the stroke) to draw outside the 380x380 box
      className={className}
      ref={ref}
      {...props}
    >
      <path
        d="M350 190C350 278.366 278.366 350 190 350C101.634 350 30 278.366 30 190C30 101.634 101.634 30 190 30C278.366 30 350 101.634 350 190Z"
        fill="inherit"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
