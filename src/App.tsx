import React from 'react'
import { LazyMotion, domAnimation, MotionConfig } from 'motion/react'
import { AppRouter } from '@/app/router'

export const App: React.FC = () => {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <AppRouter />
      </LazyMotion>
    </MotionConfig>
  )
}

export default App
