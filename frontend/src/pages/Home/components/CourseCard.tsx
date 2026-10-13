import { useTranslation } from 'react-i18next'
import type { Course } from '../types'
import ProgressBar from './ProgressBar'
import { CheckCircleIcon, PlayIcon, RefreshIcon } from './Icons'

const BADGE_STYLE = {
  inProgress: 'bg-primary text-on-primary',
  notStarted: 'bg-surface text-fg border border-border',
  completed: 'bg-tertiary-soft text-tertiary',
} as const

export default function CourseCard({ course }: { course: Course }) {
  const { t } = useTranslation('home')
  const done = course.status === 'completed'
  const percent = Math.round((course.completedLessons / course.totalLessons) * 100)

  const action = done
    ? { label: t('course.review'), icon: <RefreshIcon width={14} height={14} />, cls: 'bg-surface-muted text-fg hover:bg-primary-soft' }
    : course.isCurrent
      ? { label: t('course.continue'), icon: <ChevronGlyph />, cls: 'bg-primary-soft text-primary hover:bg-primary hover:text-on-primary' }
      : { label: t('course.study'), icon: <PlayIcon width={10} height={10} />, cls: 'bg-surface-muted text-fg hover:bg-primary-soft' }

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-surface p-3 shadow-sm">
      <div className="relative aspect-16/10 overflow-hidden rounded-xl bg-linear-to-br from-primary-soft to-surface-muted">
        {course.thumbnail && (
          <img src={course.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <span className={`absolute left-2 top-2 flex items-center gap-1 rounded-md px-2 py-0.5 font-label text-xs font-semibold ${BADGE_STYLE[course.status]}`}>
          {done && <CheckCircleIcon width={12} height={12} />}
          {t(`status.${course.status}`)}
        </span>
      </div>

      <div className="mt-3 flex-1 px-1">
        <h3 className="line-clamp-2 min-h-12 text-base font-bold leading-snug text-fg">{course.title}</h3>
        <p className="mt-1 truncate text-xs text-fg-muted">{course.instructor}</p>
      </div>

      <div className="mt-3 px-1">
        <div className="mb-1.5 flex items-center justify-between font-label text-xs">
          <span className="text-fg-muted">
            {t('course.lessons', { done: course.completedLessons, total: course.totalLessons })}
          </span>
          <span className={`font-semibold ${done ? 'text-tertiary' : 'text-primary'}`}>{percent}%</span>
        </div>
        <ProgressBar value={percent} tone={done ? 'success' : 'primary'} label={course.title} />
      </div>

      <button
        type="button"
        className={`mt-3 flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${action.cls}`}
      >
        {action.label}
        {action.icon}
      </button>
    </article>
  )
}

function ChevronGlyph() {
  return <span aria-hidden>→</span>
}
