import { useEffect } from 'react'

export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const prevTitle = document.title
    document.title = `${title} | RUNWAY`
    return () => {
      document.title = prevTitle
    }
  }, [title])
}
