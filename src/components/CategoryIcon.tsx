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
  categoryId: CategoryId
  className?: string
  size?: number
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  categoryId,
  className = 'w-4 h-4',
  size,
}) => {
  const iconProps = {
    className,
    size,
    'aria-hidden': true,
  }

  switch (categoryId) {
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
