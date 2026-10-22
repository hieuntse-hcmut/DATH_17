import type { DiscussionAuthor } from '../services/discussion.type'

export default function Avatar({
  author,
  size = 36,
}: {
  author: DiscussionAuthor
  size?: number
}) {
  const initial = author.name.split(' ').slice(-1)[0]?.charAt(0) ?? '?'
  const style = { width: size, height: size }

  return author.avatarUrl ? (
    <img src={author.avatarUrl} alt="" style={style} className="shrink-0 rounded-full object-cover" />
  ) : (
    <span
      aria-hidden
      style={style}
      className="grid shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary"
    >
      {initial}
    </span>
  )
}
