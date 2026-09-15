'use client'

import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('sweet_spoon_theme') || 'pink-feminine'
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  return <>{children}</>
}
