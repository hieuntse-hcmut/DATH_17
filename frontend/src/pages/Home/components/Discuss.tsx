import { useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import {
  useCreateDiscussionComment,
  useDeleteDiscussionComment,
  useGetCourseDiscussions,
  useUpdateDiscussionComment,
} from '~/services/discussion/discussion.query'
import type { DiscussionComment } from '~/services/discussion/discussion.type'

type SortOrder = 'newest' | 'oldest'

const EMPTY_COMMENTS: DiscussionComment[] = []

const getInitialCourseId = () => {
  const value = new URLSearchParams(window.location.search).get('courseId')
  const courseId = Number(value)
  return Number.isInteger(courseId) && courseId > 0 ? courseId : undefined
}

const formatDate = (value: string, language: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase()

export default function DiscussPage() {
  const { t, i18n } = useTranslation('home')
  const [courseId, setCourseId] = useState<number | undefined>(getInitialCourseId)
  const [courseIdInput, setCourseIdInput] = useState(
    () => String(getInitialCourseId() ?? ''),
  )
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [newContent, setNewContent] = useState('')
  const [replyToId, setReplyToId] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')

  const discussionsQuery = useGetCourseDiscussions(courseId)
  const createComment = useCreateDiscussionComment()
  const updateComment = useUpdateDiscussionComment()
  const deleteComment = useDeleteDiscussionComment()
  const comments = Array.isArray(discussionsQuery.data)
    ? discussionsQuery.data
    : EMPTY_COMMENTS

  const roots = useMemo(() => {
    return comments
      .filter((comment) => comment.parentId === null)
      .sort((left, right) => {
        const difference =
          new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
        return sortOrder === 'newest' ? -difference : difference
      })
  }, [comments, sortOrder])

  const submitComment = (event: FormEvent<HTMLFormElement>, parentId?: number) => {
    event.preventDefault()
    if (courseId === undefined) return

    const content = (parentId === undefined ? newContent : replyContent).trim()
    if (!content) return

    createComment.mutate(
      { courseId, input: { content, parentId } },
      {
        onSuccess: () => {
          if (parentId === undefined) setNewContent('')
          else {
            setReplyContent('')
            setReplyToId(null)
          }
        },
      },
    )
  }

  const submitEdit = (event: FormEvent<HTMLFormElement>, id: number) => {
    event.preventDefault()
    if (courseId === undefined || !editContent.trim()) return

    updateComment.mutate(
      { courseId, id, content: editContent.trim() },
      {
        onSuccess: () => {
          setEditingId(null)
          setEditContent('')
        },
      },
    )
  }

  const removeComment = (id: number) => {
    if (courseId === undefined || !window.confirm(t('discussion.confirm_delete'))) return
    deleteComment.mutate({ courseId, id })
  }

  const renderComment = (comment: DiscussionComment, depth = 0): ReactNode => {
    const replies = comments
      .filter((candidate) => candidate.parentId === comment.id)
      .sort(
        (left, right) =>
          new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
      )
    const isEditing = editingId === comment.id
      return (
      <article
        key={comment.id}
        className={`rounded-xl border border-border/60 bg-white p-4 shadow-xs dark:bg-surface md:p-5 ${
          depth > 0 ? 'ml-4 border-l-2 border-l-primary/30' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
            {getInitials(comment.authorName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-sm text-fg">{comment.authorName}</p>
                <time
                  dateTime={comment.createdAt}
                  className="text-xs text-fg-subtle"
                >
                  {formatDate(comment.createdAt, i18n.language)}
                </time>
              </div>
              {!comment.deleted && (
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setReplyToId(comment.id)
                      setReplyContent('')
                      setEditingId(null)
                    }}
                    className="text-primary hover:underline"
                  >
                    {t('discussion.reply')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(comment.id)
                      setEditContent(comment.content)
                      setReplyToId(null)
                    }}
                    className="text-fg-muted hover:text-primary"
                  >
                    {t('discussion.edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeComment(comment.id)}
                    disabled={deleteComment.isPending}
                    className="text-red-600 hover:underline disabled:opacity-50"
                  >
                    {t('discussion.delete')}
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <form
                onSubmit={(event) => submitEdit(event, comment.id)}
                className="mt-3 flex flex-col gap-2"
              >
                <textarea
                  value={editContent}
                  onChange={(event) => setEditContent(event.target.value)}
                  maxLength={5000}
                  required
                  autoFocus
                  aria-label={t('discussion.edit_placeholder')}
                  className="min-h-20 w-full resize-y rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-fg-muted hover:bg-surface-muted"
                  >
                    {t('discussion.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={!editContent.trim() || updateComment.isPending}
                    className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-on-primary disabled:opacity-50"
                  >
                    {t('discussion.save')}
                  </button>
                </div>
              </form>
            ) : (
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-fg">
                {comment.deleted ? t('discussion.deleted_comment') : comment.content}
              </p>
            )}

            {replyToId === comment.id && (
              <form
                onSubmit={(event) => submitComment(event, comment.id)}
                className="mt-3 flex flex-col gap-2"
              >
                <textarea
                  value={replyContent}
                  onChange={(event) => setReplyContent(event.target.value)}
                  placeholder={t('discussion.reply_placeholder')}
                  maxLength={5000}
                  required
                  autoFocus
                  className="min-h-20 w-full resize-y rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyToId(null)}
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-fg-muted hover:bg-surface-muted"
                  >
                    {t('discussion.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={!replyContent.trim() || createComment.isPending}
                    className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-on-primary disabled:opacity-50"
                  >
                    {t('discussion.reply')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        {replies.length > 0 && (
          <div className="mt-4 flex flex-col gap-3">
            {replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </article>
    )
  }

  const mutationError = createComment.error ?? updateComment.error ?? deleteComment.error

  return (
    <div className="flex h-full min-h-[calc(100vh-112px)] w-full flex-col overflow-hidden">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white dark:bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-4 py-4 md:px-8">
          <h1 className="font-['Be_Vietnam_Pro'] text-xl font-semibold tracking-tight text-fg">
            {t('discussion.title')}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                const parsedCourseId = Number(courseIdInput)
                if (Number.isInteger(parsedCourseId) && parsedCourseId > 0) {
                  setCourseId(parsedCourseId)
                  setReplyToId(null)
                  setEditingId(null)
                  setReplyContent('')
                  setEditContent('')
                }
              }}
              className="flex items-center gap-2"
            >
              <label htmlFor="discussion-course-id" className="text-xs font-semibold text-fg-muted">
                {t('discussion.course_id')}
              </label>
              <input
                id="discussion-course-id"
                type="number"
                min="1"
                required
                value={courseIdInput}
                onChange={(event) => setCourseIdInput(event.target.value)}
                placeholder={t('discussion.course_id_placeholder')}
                className="w-28 rounded-lg border border-border bg-surface px-2.5 py-2 text-sm text-fg"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-on-primary"
              >
                {t('discussion.load')}
              </button>
            </form>
            <label className="flex items-center gap-2 text-xs font-semibold text-fg-muted">
              <span>{t('discussion.sort_by')}</span>
              <select
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(event.target.value === 'oldest' ? 'oldest' : 'newest')
                }
                className="rounded-lg border border-border bg-surface px-2.5 py-2 text-sm text-fg"
              >
                <option value="newest">{t('discussion.sort_newest')}</option>
                <option value="oldest">{t('discussion.sort_oldest')}</option>
              </select>
            </label>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#FAF8FF] px-4 py-5 dark:bg-surface-muted/30 md:px-8">
          {courseId === undefined ? (
            <p className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-fg-muted">
              {t('discussion.enter_course_id')}
            </p>
          ) : discussionsQuery.isLoading ? (
            <p className="p-5 text-center text-sm text-fg-muted">{t('discussion.loading_comments')}</p>
          ) : discussionsQuery.isError ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-6 text-center">
              <p role="alert" className="text-sm text-fg-muted">
                {discussionsQuery.error.message || t('discussion.comments_error')}
              </p>
              <button
                type="button"
                onClick={() => discussionsQuery.refetch()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
              >
                {t('discussion.retry')}
              </button>
            </div>
          ) : roots.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-fg-muted">
              {t('discussion.no_comments')}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {roots.map((comment) => renderComment(comment))}
            </div>
          )}
        </div>

        {courseId !== undefined && (
          <form
            onSubmit={(event) => submitComment(event)}
            className="border-t border-border bg-white p-4 shadow-[0px_-4px_16px_rgba(0,0,0,0.03)] dark:bg-surface md:p-5"
          >
            {mutationError && (
              <p role="alert" className="mb-3 text-sm text-red-600">
                {mutationError.message || t('discussion.submit_error')}
              </p>
            )}
            <label htmlFor="new-discussion" className="sr-only">
              {t('discussion.placeholder')}
            </label>
            <div className="flex items-end gap-3">
              <textarea
                id="new-discussion"
                value={newContent}
                onChange={(event) => setNewContent(event.target.value)}
                placeholder={t('discussion.placeholder')}
                maxLength={5000}
                required
                className="min-h-20 flex-1 resize-y rounded-xl bg-surface-muted px-3.5 py-3 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={!newContent.trim() || createComment.isPending}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{t('discussion.submit')}</span>
                <FontAwesomeIcon icon={faPaperPlane} className="h-3 w-3" />
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
