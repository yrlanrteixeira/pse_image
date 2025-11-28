import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeContext } from '../context/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeContext()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      title={`Mudar para modo ${theme === 'dark' ? 'claro' : 'escuro'}`}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  )
}
