import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFire, faTrophy } from '@fortawesome/free-solid-svg-icons'
interface Props {
  name: string
  streak: number
  xp: number
}

export default function                                                                                                                                                                                  GreetingHeader({ name, streak, xp }: Props) {
  const { t, i18n } = useTranslation('home')
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 font-label text-xs font-medium text-primary">
          {t('semester', { term: 'II', year: '2024 - 2025' })}
        </span>
        <h1 className="text-3xl font-bold text-fg">
          {t('greeting', { name })} <span aria-hidden>👋</span>
        </h1>
        <p className="text-sm text-fg-muted">{t('subtitle')}</p>
      </div>

      <ul className="flex items-center gap-2 font-label text-sm font-medium">
        <li className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-fg">
          <FontAwesomeIcon icon={faFire} className="text-tertiary" />
          {t('streak', { count: streak })}
        </li>
        <li className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-fg">
          <FontAwesomeIcon icon={faTrophy} className="text-primary" />
          {xp.toLocaleString(i18n.language)} XP
        </li>
      </ul>
    </header>
  )
}
