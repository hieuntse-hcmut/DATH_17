import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStopwatch } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'

interface Props {
  totalSeconds: number
  onExpire: () => void
  paused?: boolean
}

const pad = (n: number) => String(n).padStart(2, '0')

export default function QuizTimer({ totalSeconds, onExpire, paused }: Props) {
  const { t } = useTranslation('quiz')
  // Tính theo mốc thời gian thực để không lệch khi tab bị throttle
  const endAt = useRef(Date.now() + totalSeconds * 1000)
  const [left, setLeft] = useState(totalSeconds)
  const expired = useRef(false)

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => {
      const s = Math.max(0, Math.round((endAt.current - Date.now()) / 1000))
      setLeft(s)
      if (s === 0 && !expired.current) {
        expired.current = true
        onExpire()
      }
    }, 500)
    return () => window.clearInterval(id)
  }, [paused, onExpire])

  const urgent = left <= 60

  return (
    <div
      role="timer"
      aria-label={t('attempt.timeLeft')}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-label text-sm font-semibold tabular-nums ${
        urgent ? 'animate-pulse bg-danger text-on-primary' : 'bg-danger/10 text-danger'
      }`}
    >
      <FontAwesomeIcon icon={faStopwatch} />
      {pad(Math.floor(left / 60))}:{pad(left % 60)}
    </div>
  )
}
