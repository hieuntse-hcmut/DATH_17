import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  type: ToastType
  message: string
}

interface ToastApi {
  show: (message: string, type?: ToastType, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const styles: Record<ToastType, { icon: typeof faCircleInfo; color: string }> = {
  success: { icon: faCircleCheck, color: 'text-emerald-500' },
  error: { icon: faCircleExclamation, color: 'text-danger' },
  info: { icon: faCircleInfo, color: 'text-primary' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const remove = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (message: string, type: ToastType = 'info', duration = 4000) => {
      const id = ++idRef.current
      setToasts((list) => [...list, { id, type, message }])
      if (duration > 0) setTimeout(() => remove(id), duration)
    },
    [remove],
  )

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (m, d) => show(m, 'success', d),
      error: (m, d) => show(m, 'error', d),
      info: (m, d) => show(m, 'info', d),
    }),
    [show],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-surface p-3 text-sm text-fg shadow-lg"
          >
            <FontAwesomeIcon
              icon={styles[t.type].icon}
              className={`mt-0.5 ${styles[t.type].color}`}
            />
            <p className="flex-1 break-words">{t.message}</p>
            <button
              type="button"
              onClick={() => remove(t.id)}
              aria-label="Close"
              className="text-fg-subtle hover:text-fg"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}