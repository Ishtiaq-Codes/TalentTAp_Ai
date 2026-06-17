import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Check, Loader2, Sparkles, MessageSquare, Briefcase, FileText } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'

const ICON_MAP = {
  match:       { icon: Sparkles,     bg: 'bg-violet-100', color: 'text-violet-600' },
  message:     { icon: MessageSquare,bg: 'bg-blue-100',   color: 'text-blue-600' },
  application: { icon: FileText,     bg: 'bg-indigo-100', color: 'text-indigo-600' },
  job_status:  { icon: Briefcase,    bg: 'bg-amber-100',  color: 'text-amber-600' },
  default:     { icon: Bell,         bg: 'bg-slate-100',  color: 'text-slate-500' },
}

function formatTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1)  return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7)  return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const { unreadCount, notifications, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotifications()

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = () => {
    if (!isOpen) fetchNotifications()
    setIsOpen(!isOpen)
  }

  const handleNotificationClick = (n) => {
    if (!n.is_read) markAsRead(n.id)
    setIsOpen(false)
    if (n.action_url) navigate(n.action_url)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleToggle}
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
          isOpen ? 'bg-violet-50 text-violet-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
        )}
        aria-label="Notifications"
      >
        <Bell className="h-4.5 w-4.5" style={{ height: '18px', width: '18px' }} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-violet-600 px-1 text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-[340px] rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 animate-scale-in origin-top-right overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="badge badge-primary">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors"
              >
                <Check className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 mb-3">
                  <Bell className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-800">All caught up!</p>
                <p className="text-xs text-slate-400 mt-1">New updates will appear here.</p>
              </div>
            ) : (
              <div>
                {notifications.map((n) => {
                  const config = ICON_MAP[n.type] || ICON_MAP.default
                  const Icon = config.icon
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={cn(
                        'w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors border-b border-slate-50 last:border-0',
                        n.is_read ? 'hover:bg-slate-50' : 'bg-violet-50/50 hover:bg-violet-50'
                      )}
                    >
                      <div className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl mt-0.5', config.bg)}>
                        <Icon className={cn('h-4 w-4', config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-[13px] leading-tight', n.is_read ? 'font-medium text-slate-700' : 'font-semibold text-slate-900')}>
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1.5">{formatTime(n.created_at)}</p>
                      </div>
                      {!n.is_read && (
                        <div className="h-2 w-2 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 p-2">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="block w-full rounded-xl py-2 text-center text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-violet-600 transition-colors"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
