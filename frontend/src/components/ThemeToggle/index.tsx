import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'theme'

// Đồng bộ với class đã được script trong index.html gắn sẵn
const getCurrentTheme = (): Theme =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'light'

interface Props {
  className?: string
}

export default function ThemeToggle({ className = '' }: Props) {
  const [theme, setTheme] = useState<Theme>(getCurrentTheme)

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.classList.toggle('dark', next === 'dark')
    localStorage.setItem(STORAGE_KEY, next)
    setTheme(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`grid size-16 place-items-center rounded-full border border-border bg-surface text-fg-muted transition hover:bg-primary-soft hover:text-primary ${className}`}
    >
      {theme === 'dark' ? <FontAwesomeIcon icon={faSun} /> : <FontAwesomeIcon icon={faMoon} />}
    </button>
  )
}