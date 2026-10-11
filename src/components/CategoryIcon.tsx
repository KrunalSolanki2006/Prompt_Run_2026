import React from 'react'
import {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Receipt,
  GraduationCap,
  HeartPulse,
  Users,
  CreditCard,
  PiggyBank,
  Ellipsis,
} from 'lucide-react'
import type { CategoryId } from '@/engine/types'

interface CategoryIconProps {
  categoryId?: CategoryId
  category?: CategoryId
  className?: string
  size?: number | string
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  categoryId,
  category,
  className = 'w-4 h-4',
  size,
}) => {
  const cat = categoryId ?? category ?? 'other'
  const numericSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 14
      : size === 'lg'
      ? 20
      : undefined

  const iconProps = {
    className,
    size: numericSize,
    'aria-hidden': true,
  }

  switch (cat) {
    case 'food':
      return <Utensils {...iconProps} />
    case 'transport':
      return <Car {...iconProps} />
    case 'shopping':
      return <ShoppingBag {...iconProps} />
    case 'entertainment':
      return <Film {...iconProps} />
    case 'bills':
      return <Receipt {...iconProps} />
    case 'education':
      return <GraduationCap {...iconProps} />
    case 'health':
      return <HeartPulse {...iconProps} />
    case 'social':
      return <Users {...iconProps} />
    case 'subscriptions':
      return <CreditCard {...iconProps} />
    case 'savings':
      return <PiggyBank {...iconProps} />
    case 'other':
    default:
      return <Ellipsis {...iconProps} />
  }
}
