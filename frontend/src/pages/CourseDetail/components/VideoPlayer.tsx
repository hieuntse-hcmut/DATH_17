import { faBookOpen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

const DONE_RATIO = 0.8 // xem đủ 80% thì tính là xong
const SEEK_TOLERANCE = 2 // giây: sai số cho phép khi so với vị trí xa nhất
const TICK_MS = 250
const EMIT_EVERY_MS = 5000

export interface VideoProgress {
  position: number // vị trí đang xem (giây)
  furthest: number // vị trí xa nhất đã xem hợp lệ (giây)
  duration: number // tổng thời lượng (giây)
  percent: number // 0..1, theo furthest
}

interface YTPlayerEvent {
  data: number
}

interface YTPlayer {
  getCurrentTime(): number
  getDuration(): number
  getPlaybackRate(): number
  seekTo(seconds: number, allowSeekAhead: boolean): void
  destroy(): void
}

declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement, options: Record<string, unknown>) => YTPlayer
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiPromise: Promise<void> | null = null
const loadYouTubeApi = (): Promise<void> => {
  if (window.YT?.Player) return Promise.resolve()
  apiPromise ??= new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  })
  return apiPromise
}

const getYoutubeId = (url?: string) => {
  if (!url) return ''
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)
  return m?.[1] ?? ''
}

interface Props {
  videoUrl?: string
  title: string
  startAt?: number // giây, để xem tiếp từ chỗ đã dừng
  onOpenToc: () => void
  onProgress?: (p: VideoProgress) => void
  onDone?: () => void // gọi một lần khi xem đủ 80%
}

export default function VideoPlayer({
  videoUrl,
  title,
  startAt = 0,
  onOpenToc,
  onProgress,
  onDone,
}: Props) {
  const { t } = useTranslation('courseDetail')
  const id = getYoutubeId(videoUrl)

  const hostRef = useRef<HTMLDivElement>(null)
  const startAtRef = useRef(startAt)
  const onProgressRef = useRef(onProgress)
  const onDoneRef = useRef(onDone)
  onProgressRef.current = onProgress
  onDoneRef.current = onDone

  useEffect(() => {
    if (!id || !hostRef.current) return

    let disposed = false
    let timer: number | undefined
    let player: YTPlayer | undefined
    let mount: HTMLDivElement | undefined
    let furthest = startAtRef.current
    let lastEmit = 0
    let lastTickAt = Date.now()
    let doneFired = false

    const ready = () => !!player && typeof player.getCurrentTime === 'function'

    const emit = () => {
      if (!player || !ready()) return
      const total = player.getDuration() || 0
      onProgressRef.current?.({
        position: player.getCurrentTime(),
        furthest,
        duration: total,
        percent: total ? furthest / total : 0,
      })
    }

    const tick = () => {
      if (!player || !ready()) return
      const now = Date.now()
      const elapsed = (now - lastTickAt) / 1000
      lastTickAt = now

      const time = player.getCurrentTime()
      const total = player.getDuration() || 0
      const rate = player.getPlaybackRate?.() || 1

      // Phát bình thường (kể cả tốc độ 2x, tab bị trình duyệt làm chậm timer)
      // chỉ tiến được khoảng elapsed * rate. Nhảy xa hơn thế = tua tới trước.
      const allowed = furthest + SEEK_TOLERANCE + elapsed * rate
      if (time > allowed) {
        player.seekTo(furthest, true)
        return
      }

      furthest = Math.max(furthest, time)

      if (now - lastEmit > EMIT_EVERY_MS) {
        lastEmit = now
        emit()
      }

      if (!doneFired && total && furthest / total >= DONE_RATIO) {
        doneFired = true
        emit()
        onDoneRef.current?.()
      }
    }

    loadYouTubeApi().then(() => {
      if (disposed || !hostRef.current || !window.YT) return

      // YouTube thay phần tử được truyền vào bằng iframe, nên tạo node riêng để dọn dẹp dễ
      mount = document.createElement('div')
      hostRef.current.appendChild(mount)

      player = new window.YT.Player(mount, {
        videoId: id,
        playerVars: {
          controls: 1, // giữ thanh điều khiển gốc: tốc độ, chất lượng, toàn màn hình...
          fs: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          start: Math.floor(startAtRef.current),
        },
        events: {
          onStateChange: (e: YTPlayerEvent) => {
            // 1: đang phát, 2: tạm dừng, 3: đang đệm. Kiểm tra ngay sau khi tua
            if (e.data === 1 || e.data === 2 || e.data === 3) tick()
            if (e.data !== 1) emit()
          },
        },
      })
      lastTickAt = Date.now()
      timer = window.setInterval(tick, TICK_MS)
    })

    return () => {
      disposed = true
      window.clearInterval(timer)
      emit() // lưu vị trí cuối trước khi rời bài
      player?.destroy()
      mount?.remove()
    }
  }, [id])

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {id && (
          <div
            ref={hostRef}
            title={title}
            className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full"
          />
        )}
      </div>

      {/* Nút mở mục lục (mobile): nằm dưới video để không đè lên nút của YouTube */}
      <div className="flex justify-end px-4 pt-3 sm:px-6 lg:hidden">
        <button
          type="button"
          onClick={onOpenToc}
          className="flex items-center gap-1.5 rounded-lg bg-surface-muted px-3 py-1.5 font-label text-xs font-medium text-fg"
        >
          <FontAwesomeIcon icon={faBookOpen} aria-hidden />
          {t('toc')}
        </button>
      </div>
    </div>
  )
}