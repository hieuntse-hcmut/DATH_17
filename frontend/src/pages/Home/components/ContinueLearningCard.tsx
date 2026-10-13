import { useTranslation } from 'react-i18next'
import type { CurrentLesson } from '../types'
import ProgressBar from './ProgressBar'
import { ClockIcon, FileIcon, PlayIcon } from './Icons'

export default function ContinueLearningCard({ lesson }: { lesson: CurrentLesson }) {
  const { t } = useTranslation('home')
  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <span className="inline-flex rounded-md bg-primary px-2.5 py-1 font-label text-xs font-semibold text-on-primary">
        {t('continue.badge')}
      </span>

      <div className="mt-4 grid gap-5 md:grid-cols-[280px_1fr]">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-linear-to-br from-primary to-secondary">
          {lesson.thumbnail && (
            <img src={lesson.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <button
            type="button"
            aria-label={t('continue.resume')}
            className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-on-primary shadow-lg transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <PlayIcon width={18} height={18} />
          </button>
          <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-0.5 font-label text-xs text-white">
            {lesson.position} / {lesson.duration}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className="font-label text-xs text-fg-muted">
              <span className="font-semibold text-primary">{lesson.courseTitle}</span>
              {' • '}
              {t('continue.chapter', { n: lesson.chapter })}
            </p>
            <p className="flex shrink-0 items-center gap-1 font-label text-xs text-fg-subtle">
              <ClockIcon width={14} height={14} />
              {t('continue.lastStudied', { count: lesson.studiedHoursAgo })}
            </p>
          </div>
          <h2 className="mt-2 text-xl font-bold leading-snug text-fg">{lesson.title}</h2>
          <p className="mt-2 line-clamp-2 text-sm text-fg-muted">{lesson.description}</p>

          <div className="mt-4 flex items-center justify-between font-label text-xs">
            <span className="text-fg-muted">{t('continue.currentProgress')}</span>
            <span className="font-semibold text-primary">
              {t('continue.percentDone', { percent: lesson.progress })}
            </span>
          </div>
          <div className="mt-1.5">
            <ProgressBar value={lesson.progress} label={t('continue.currentProgress')} />
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-muted px-4 py-3">
        <p className="flex items-center gap-2 font-label text-xs text-fg-muted">
          <FileIcon />
          {t('continue.attachments', { count: lesson.attachmentCount })}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-primary-soft"
          >
            {t('continue.viewDetail')}
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover"
          >
            <PlayIcon width={14} height={14} />
            {t('continue.resume')}
          </button>
        </div>
      </div>
    </section>
  )
}
