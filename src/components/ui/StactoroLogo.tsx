interface StactoroLogoProps {
  size?: number
  className?: string
}

export function StactoroMark({ size = 36, className }: StactoroLogoProps) {
  const r = Math.round(size * 0.25)
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: "linear-gradient(135deg, #F59E0B, #D97706)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width={size * 0.68}
        height={size * 0.68}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left horn */}
        <path
          d="M7.5 9C7.5 9 5 7 4.5 4C4 1.5 6 0.5 7.5 2C8.5 3 8 5.5 8.5 8"
          fill="#0a0800"
          stroke="#0a0800"
          strokeWidth="0.3"
        />
        {/* Right horn */}
        <path
          d="M16.5 9C16.5 9 19 7 19.5 4C20 1.5 18 0.5 16.5 2C15.5 3 16 5.5 15.5 8"
          fill="#0a0800"
          stroke="#0a0800"
          strokeWidth="0.3"
        />
        {/* Head */}
        <path
          d="M7.5 8.5C5.5 8.5 5 9.5 5 11V15.5C5 17.5 6.5 19.5 12 19.5C17.5 19.5 19 17.5 19 15.5V11C19 9.5 18.5 8.5 16.5 8.5H7.5Z"
          fill="#0a0800"
        />
        {/* Snout */}
        <ellipse cx="12" cy="17.5" rx="4.5" ry="3" fill="#0a0800" />
        {/* Nostrils */}
        <circle cx="10.2" cy="18" r="1.1" fill="#F59E0B" opacity="0.6" />
        <circle cx="13.8" cy="18" r="1.1" fill="#F59E0B" opacity="0.6" />
        {/* Eyes */}
        <circle cx="9" cy="12.5" r="1.4" fill="#F59E0B" opacity="0.7" />
        <circle cx="15" cy="12.5" r="1.4" fill="#F59E0B" opacity="0.7" />
      </svg>
    </div>
  )
}
