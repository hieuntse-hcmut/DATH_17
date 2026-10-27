import { useTranslation } from 'react-i18next'

export default function GreetingHeader({ name }: {name: string}) {
  const { t } = useTranslation('home')
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 font-label text-xs font-medium text-primary">
          {t('semester', { term: 'test', year: '2024 test 2025' })}
        </span>
        <h1 className="text-3xl font-bold text-fg">
          {t('greeting', { name })} <span aria-hidden>👋</span>
        </h1>
        <p className="text-sm text-fg-muted">{t('subtitle')}</p>
      </div>
    </header>
  )
}
