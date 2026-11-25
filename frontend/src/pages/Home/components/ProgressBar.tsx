interface Props {
  value: number
  tone?: 'primary' | 'success'
  label?: string
}

export default function ProgressBar({ value, tone = 'primary', label }: Props) {
  const v = Math.min(100, Math.max(0, value))
  const track = tone === 'success' ? 'bg-tertiary-soft' : 'bg-primary-soft'
  const fill = tone === 'success' ? 'bg-tertiary' : 'bg-primary'
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      className={`h-1.5 w-full overflow-hidden rounded-full ${track}`}
    >
      <div className={`h-full rounded-full transition-[width] duration-500 ${fill}`} style={{ width: `${v}%` }} />
    </div>
  )
}
