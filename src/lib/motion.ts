import type { Variants, Transition } from 'motion/react'

/**
 * Standard durations and easing for RUNWAY
 * 150-250ms ease-out transitions targeting opacity and transform only.
 */
export const transitions: Record<string, Transition> = {
  instant: { duration: 0 },
  fast: { duration: 0.15, ease: 'easeOut' },
  default: { duration: 0.22, ease: 'easeOut' },
  gentle: { duration: 0.25, ease: 'easeOut' },
}

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.default,
  },
}

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.default,
  },
}

export const scaleUpVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.fast,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: transitions.fast,
  },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
}

export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.fast,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: transitions.fast,
  },
}
