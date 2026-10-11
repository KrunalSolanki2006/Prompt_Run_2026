import React from 'react'
import { Label } from '@/components/ui/label'

interface FormFieldProps {
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: (props: {
    id: string
    'aria-describedby'?: string
    'aria-invalid'?: boolean
  }) => React.ReactNode
  className?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required = false,
  hint,
  error,
  children,
  className = '',
}) => {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <Label
          htmlFor={id}
          className="text-sm font-semibold text-[#16140F] flex items-center gap-1"
        >
          {label}
          {required && (
            <span className="text-[#B42318]" aria-hidden="true">
              *
            </span>
          )}
        </Label>
      </div>

      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': !!error,
      })}

      {hint && !error && (
        <p id={hintId} className="text-xs text-[#5E5A52]">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className="text-xs font-semibold text-[#B42318] flex items-center gap-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
