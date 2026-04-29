interface StactoroLogoProps {
  size?: number
  className?: string
}

export function StactoroMark({ size = 36, className }: StactoroLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/stactoro-icon.svg"
      width={size}
      height={size}
      alt="Stactoro"
      style={{ objectFit: "contain", flexShrink: 0, display: "block", borderRadius: 6 }}
      className={className}
    />
  )
}
