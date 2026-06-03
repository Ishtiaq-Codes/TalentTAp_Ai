import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Check, Loader2, Sparkles, MessageSquare, Briefcase, FileText } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const { 
    unreadCount, 
    notifications, 
    loading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications()
    }
    setIsOpen(!isOpen)
  }

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
    setIsOpen(false)
    if (notification.action_url) {
      navigate(notification.action_url)
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'match': return <Sparkles className="h-4 w-4 text-emerald-500" />
      case 'message': return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'application': return <FileText className="h-4 w-4 text-primary" />
      case 'job_status': return <Briefcase className="h-4 w-4 text-amber-500" />
      default: return <Bell className="h-4 w-4 text-slate-400" />
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 sm:w-96 rounded-2xl border bg-white shadow-xl animate-fade-in-up origin-top-right overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-3 bg-slate-50/50">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <Check className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-3">
                  <Bell className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-900">No notifications yet</p>
                <p className="text-xs text-muted-foreground mt-1">When you get updates, they'll show up here.</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map(notification => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full flex items-start gap-3 p-4 text-left transition-colors hover:bg-slate-50 ${
                      !notification.is_read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="mt-1 shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm border">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.is_read ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1.5">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t p-2 bg-slate-50">
            <Link 
              to="/notifications" 
              onClick={() => setIsOpen(false)}
              className="block w-full rounded-lg py-2 text-center text-xs font-semibold text-slate-600 hover:bg-slate-200/50 transition-colors"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
