import type { ReactNode } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import { useTheme } from '../hooks/useTheme'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeState = useTheme()

  return (
    <ThemeContext.Provider value={themeState}>
      {children}
    </ThemeContext.Provider>
  )
}
