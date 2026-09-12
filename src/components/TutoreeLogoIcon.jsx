/**
 * TutoreeLogoIcon — Clean minimal SVG logo
 * A bold "T" mark with a subtle arc on top resembling an open book / graduation
 */
export function TutoreeLogoIcon({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Tutoree logo"
    >
      {/* Rounded square background */}
      <rect width="40" height="40" rx="10" fill="#2563EB" />

      {/* Bold "T" letterform */}
      <rect x="8" y="11" width="24" height="3.5" rx="1.75" fill="white" />
      <rect x="18.25" y="11" width="3.5" height="19" rx="1.75" fill="white" />

      {/* Small arc — open-book / learning accent above the T bar */}
      <path
        d="M14 11 Q20 6 26 11"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
    </svg>
  )
}

/**
 * TutoreeLogo — Full wordmark with icon
 */
export function TutoreeLogo({ iconSize = 28, textSize = 'text-base', className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TutoreeLogoIcon size={iconSize} />
      <span className={`font-bold text-gray-900 dark:text-white tracking-tight ${textSize}`}>
        Tutoree
      </span>
    </div>
  )
}
