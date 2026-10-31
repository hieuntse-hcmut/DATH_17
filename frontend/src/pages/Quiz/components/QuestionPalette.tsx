import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faFlag, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import type { QuestionStatus } from '../services/quiz.type'

interface Props {
  statuses: QuestionStatus[] // theo thứ tự câu; "flagged" được ưu tiên hơn "answered"
  answeredCount: number
  flaggedCount: number
  currentIndex: number
  onJump: (index: number) => void
  /** Có truyền => hiển thị dạng bottom sheet (mobile) */
  onClose?: () => void
}

const cellClass: Record<QuestionStatus, string> = {
  flagged: 'bg-danger/10 text-danger border-danger/30',
  answered: 'bg-tertiary-soft text-tertiary border-tertiary/30',
  unanswered: 'bg-surface-muted text-fg-muted border-transparent',
}

export default function QuestionPalette({
  statuses,
  answeredCount,
  flaggedCount,
  currentIndex,
  onJump,
  onClose,
}: Props) {
  const { t } = useTranslation('quiz')
  const total = statuses.length

  return (
    <div className="p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-label text-sm font-semibold text-fg">
            {onClose ? t('palette.mobileTitle', { total }) : t('palette.title', { total })}
          </h2>
          {onClose && <p className="mt-0.5 text-xs text-fg-muted">{t('palette.mobileHint')}</p>}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={t('palette.close')}
            className="cursor-pointer flex size-8 items-center justify-center rounded-full bg-surface-muted text-fg-muted"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}
      </div>

      <div className="mb-4 grid grid-cols-3 rounded-lg bg-surface-muted py-2 text-center font-label text-xs text-fg-muted">
        <div>
          <b className="block text-base text-tertiary">{answeredCount}</b>
          {t('palette.answered')}
        </div>
        <div>
          <b className="block text-base text-danger">{flaggedCount}</b>
          {t('palette.flagged')}
        </div>
        <div>
          <b className="block text-base text-fg">{total - answeredCount}</b>
          {t('palette.unanswered')}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {statuses.map((s, i) => {
          const current = i === currentIndex
          return (
            <button
              key={i}
              type="button"
              onClick={() => onJump(i)}
              aria-label={t('palette.goTo', { n: i + 1 })}
              aria-current={current ? 'step' : undefined}
              className={`cursor-pointer relative flex aspect-square items-center justify-center rounded-lg border font-label text-sm font-semibold transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-primary ${
                current ? 'border-primary bg-primary text-on-primary shadow-sm' : cellClass[s]
              }`}
            >
              {i + 1}
              {s === 'answered' && !current && (
                <FontAwesomeIcon icon={faCheck} className="absolute bottom-1 right-1 text-[8px]" />
              )}
              {s === 'flagged' && <FontAwesomeIcon icon={faFlag} className="absolute right-1 top-1 text-[8px]" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
