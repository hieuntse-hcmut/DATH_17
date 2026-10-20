import { faArrowLeft, faArrowRight, faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'

interface Props {
  hasPrev: boolean
  hasNext: boolean
  understood: boolean
  onPrev: () => void
  onNext: () => void
  onUnderstood: () => void
}

export default function LessonActions({
  hasPrev,
  hasNext,
  understood,
  onPrev,
  onNext,
  onUnderstood,
}: Props) {
  const { t } = useTranslation('courseDetail')

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onPrev}
        disabled={!hasPrev}
        aria-label={t('prev')}
        className="flex h-11 items-center gap-2 rounded-xl bg-primary-soft px-4 font-label text-sm font-medium text-primary transition hover:opacity-80 disabled:opacity-40"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        <span className="hidden sm:inline">{t('prev')}</span>
      </button>

      <div className="ml-auto flex flex-1 items-center justify-end gap-3 sm:flex-none">
        <button
          type="button"
          onClick={onUnderstood}
          className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-tertiary px-4 font-label text-sm font-semibold text-white transition sm:flex-none ${
            understood ? 'opacity-80' : 'hover:opacity-90'
          }`}
        >
          <FontAwesomeIcon icon={faCircleCheck} />
          {t('understood')}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-label text-sm font-semibold text-on-primary transition hover:bg-primary-hover disabled:opacity-40 sm:flex-none"
        >
          {t('next')}
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    </div>
  )
}
