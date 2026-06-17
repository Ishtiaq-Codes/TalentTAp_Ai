import { AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { createPortal } from 'react-dom'

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  isDestructive = false,
}) {
  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(8, 12, 30, 0.5)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white shadow-2xl shadow-slate-900/20 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon header */}
        <div className="flex flex-col items-center px-6 pt-8 pb-4 text-center">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl mb-4 ${
            isDestructive ? 'bg-red-100' : 'bg-violet-100'
          }`}>
            {isDestructive
              ? <AlertTriangle className="h-6 w-6 text-red-600" />
              : <CheckCircle2 className="h-6 w-6 text-violet-600" />
            }
          </div>
          <h2 className="text-lg font-bold text-slate-900 leading-tight">{title}</h2>
          {message && (
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 shadow-sm shadow-red-200'
                : 'bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-200'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
