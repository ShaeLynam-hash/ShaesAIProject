interface StactoroLogoProps {
  size?: number
  className?: string
}

export function StactoroMark({ size = 36, className }: StactoroLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/stactoro-icon.png"
      width={size}
      height={size}
      alt="Stactoro"
      style={{ objectFit: "contain", flexShrink: 0, display: "block", filter: "brightness(0) invert(1)" }}
      className={className}
    />
  )
}
