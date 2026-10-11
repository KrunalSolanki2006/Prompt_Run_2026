import { useEffect } from 'react'
import { useLocation } from 'react-router'

export function useFocusH1(): void {
  const location = useLocation()

  useEffect(() => {
    // Slight tick to allow DOM mount after Suspense resolution
    const timer = setTimeout(() => {
      const h1 = document.querySelector('h1')
      if (h1 instanceof HTMLElement) {
        if (!h1.hasAttribute('tabindex')) {
          h1.setAttribute('tabindex', '-1')
        }
        h1.focus({ preventScroll: false })
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [location.pathname])
}
