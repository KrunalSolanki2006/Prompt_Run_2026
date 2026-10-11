import React from 'react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  className?: string
  receiptBorder?: boolean
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
  receiptBorder = true,
}) => {
  return (
    <div
      className={`bg-white rounded-[14px] p-8 text-center flex flex-col items-center justify-center ${
        receiptBorder ? 'border-2 border-dashed border-[#E6DFD2]' : 'border border-[#E6DFD2]'
      } ${className}`}
      role="region"
      aria-label={title}
    >
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2] flex items-center justify-center text-[#5E5A52] mb-3.5">
          {icon}
        </div>
      )}

      <h3 className="font-['Bricolage_Grotesque_Variable'] font-bold text-lg text-[#16140F]">
        {title}
      </h3>

      <p className="text-sm text-[#5E5A52] max-w-sm mt-1 mb-5 leading-relaxed">
        {description}
      </p>

      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
