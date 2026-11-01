export interface YTPlayerEvent {
  data: number
  target: YTPlayer
}

export interface YTPlayer {
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

export const getYouTubeId = (url?: string): string => {
  if (!url) return ''
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/,
  )
  return m?.[1] ?? ''
}

let apiPromise: Promise<void> | null = null

export const loadYouTubeApi = (): Promise<void> => {
  if (window.YT?.Player) return Promise.resolve()
  apiPromise ??= new Promise<void>((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.onerror = () => {
      apiPromise = null // cho phép thử lại
      reject(new Error('Cannot load YouTube API'))
    }
    document.head.appendChild(script)
  })
  return apiPromise
}

/** Tổng thời lượng (giây), hoặc null nếu không lấy được */
export const getYouTubeDuration = async (
  videoId: string,
  timeoutMs = 8000,
): Promise<number | null> => {
  try {
    await loadYouTubeApi()
  } catch {
    return null
  }

  return new Promise((resolve) => {
    const host = document.createElement('div')
    host.style.cssText = 'position:fixed;left:-9999px;width:1px;height:1px;'
    document.body.appendChild(host)

    let done = false
    let player: YTPlayer | undefined
    let poll: number | undefined
    let timer: number | undefined

    const finish = (value: number | null) => {
      if (done) return
      done = true
      window.clearInterval(poll)
      window.clearTimeout(timer)
      try { player?.destroy() } catch { /* noop */ }
      host.remove()
      resolve(value)
    }

    timer = window.setTimeout(() => finish(null), timeoutMs)

    player = new window.YT!.Player(host, {
      videoId,
      events: {
        onReady: (e: YTPlayerEvent) => {
          // getDuration() có thể trả 0 lúc mới ready -> poll
          poll = window.setInterval(() => {
            const d = e.target.getDuration()
            if (d > 0) finish(Math.round(d))
          }, 300)
        },
        onError: () => finish(null),
      },
    })
  })
}