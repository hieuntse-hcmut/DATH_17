import LanguageSwitcher from '~/components/LanguageSwitcher'
import ThemeToggle from '~/components/ThemeToggle'

export default function LangThemeToggle({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LanguageSwitcher />
      <ThemeToggle />
    </div>
  )
}