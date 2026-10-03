import { useTranslation } from 'react-i18next'
import { supportedLngs } from '~/i18n'

const LABELS: Record<(typeof supportedLngs)[number], string> = {
  vi: 'Tiếng Việt',
  en: 'English',
}

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <select
      value={i18n.resolvedLanguage}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="rounded border px-2 py-1 text-sm"
      aria-label="Language"
    >
      {supportedLngs.map((lng) => (
        <option key={lng} value={lng}>
          {LABELS[lng]}
        </option>
      ))}
    </select>
  )
}