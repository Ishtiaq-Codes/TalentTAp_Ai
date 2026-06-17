import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { createPortal } from 'react-dom'

const ToastContext = createContext(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    bar: '#10B981',
    iconColor: 'text-emerald-500',
    title: 'Success',
  },
  error: {
    icon: XCircle,
    bar: '#EF4444',
    iconColor: 'text-red-500',
    title: 'Error',
  },
  info: {
    icon: Info,
    bar: '#7C52E8',
    iconColor: 'text-violet-500',
    title: 'Info',
  },
  warning: {
    icon: AlertTriangle,
    bar: '#F59E0B',
    iconColor: 'text-amber-500',
    title: 'Warning',
  },
}

function Toast({ toast, onRemove }) {
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info
  const Icon = config.icon

  return (
    <div
      className="group relative flex w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-[0_8px_32px_rgba(8,12,30,0.12)] border border-slate-100 animate-slide-in-right"
      style={{ willChange: 'transform' }}
    >
      {/* Left accent bar */}
      <div className="w-1 flex-shrink-0" style={{ backgroundColor: config.bar }} />

      {/* Content */}
      <div className="flex flex-1 items-start gap-3 px-4 py-3.5">
        <div className="mt-0.5 flex-shrink-0">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ backgroundColor: config.bar + '15' }}
          >
            <Icon className={`h-4.5 w-4.5 ${config.iconColor}`} style={{ height: '18px', width: '18px' }} />
          </div>
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-semibold text-slate-900 leading-tight">{config.title}</p>
          <p className="mt-0.5 text-xs text-slate-500 leading-relaxed break-words">{toast.message}</p>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 -mt-0.5 -mr-1 flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      {toast.duration > 0 && (
        <div
          className="absolute bottom-0 left-1 right-0 h-[2px] origin-left"
          style={{
            backgroundColor: config.bar,
            opacity: 0.3,
            animation: `progressBar ${toast.duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => {
      // Max 4 toasts
      const limited = prev.length >= 4 ? prev.slice(1) : prev
      return [...limited, { id, message, type, duration }]
    })
    if (duration > 0) {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration)
    }
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast])
  const error   = useCallback((message, duration) => addToast(message, 'error', duration), [addToast])
  const info    = useCallback((message, duration) => addToast(message, 'info', duration), [addToast])
  const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast])

  return (
    <ToastContext.Provider value={{ success, error, info, warning }}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          aria-label="Notifications"
          className="fixed bottom-6 right-4 z-[9999] flex flex-col-reverse gap-2.5 w-full max-w-sm pointer-events-none sm:bottom-6 sm:right-6"
        >
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast toast={toast} onRemove={removeToast} />
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}
