import { useTheme } from '../hooks/useTheme.js'
import { MoonIcon, SunIcon } from './Icons.jsx'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Toggle theme"
      onClick={toggleTheme}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
