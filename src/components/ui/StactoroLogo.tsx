interface StactoroLogoProps {
  size?: number
  className?: string
}

export function StactoroMark({ size = 36, className }: StactoroLogoProps) {
  const r = Math.round(size * 0.25)
  const iconSize = Math.round(size * 0.7)
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: "linear-gradient(135deg, #C41E1E, #7B0F0F)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Flame - top right */}
        <path d="M16.5,2 C18.5,0 22,0.5 22,4 C19.5,3.5 20.5,6.5 18,7 C20,9 17.5,12 14,9.5 C17,8 14.5,5 16.5,2.5Z" fill="#F59E0B"/>
        {/* Left horn */}
        <path d="M7.5,11 C5,7 2.5,5.5 1.5,7 C3,8.5 5.5,10.5 7.5,11" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Right horn */}
        <path d="M11.5,10 C12,6.5 11,4 9,4.5 C9.5,6.5 11,9 11.5,10" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Bull head */}
        <path d="M4,12 C1.5,13 1.5,16.5 2.5,19.5 C3.5,22 6.5,23.5 9.5,23.5 C12.5,23.5 15,21.5 15.5,18.5 C16,15.5 14.5,13 11.5,12 C9.5,11.5 6.5,11.5 4,12Z" fill="white" opacity="0.92"/>
        {/* Eye */}
        <circle cx="7" cy="15.5" r="1.5" fill="#B91C1C"/>
        {/* Speed line */}
        <path d="M2.5,22.5 Q8.5,20.5 14.5,22.5" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6"/>
      </svg>
    </div>
  )
}
