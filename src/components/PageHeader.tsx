import React from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  badge?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  className = '',
}) => {
  return (
    <header className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 ${className}`}>
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1
            tabIndex={-1}
            className="font-['Bricolage_Grotesque_Variable'] text-2xl sm:text-3xl font-bold tracking-tight text-[#16140F] focus:outline-none"
          >
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-sm text-[#5E5A52] mt-1 font-medium max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </header>
  )
}
