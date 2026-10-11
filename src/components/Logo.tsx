import React from 'react'
import { Link } from 'react-router'

interface LogoProps {
  className?: string
  to?: string
  showTagline?: boolean
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  to = '/',
  showTagline = false,
}) => {
  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-[#16140F] flex items-center justify-center p-1.5 shadow-xs border border-[#16140F]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Runway track lines */}
          <path
            d="M4 19L9 5M20 19L15 5"
            stroke="#FBF8F3"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Dashed center line in Volt */}
          <path
            d="M12 7V9M12 12V14M12 17V19"
            stroke="#D4F23A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div>
        <span className="font-['Bricolage_Grotesque_Variable'] text-xl font-bold tracking-tight text-[#16140F] block leading-none">
          RUNWAY
        </span>
        {showTagline && (
          <span className="text-[11px] font-medium text-[#5E5A52] tracking-wider uppercase block mt-0.5">
            30-Day Cockpit
          </span>
        )}
      </div>
    </div>
  )

  if (to) {
    return (
      <Link
        to={to}
        className="inline-flex items-center focus-visible:outline-2 focus-visible:outline-[#16140F] rounded-md"
        aria-label="RUNWAY home"
      >
        {content}
      </Link>
    )
  }

  return content
}
