import { useState, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Bell, LogOut, Menu, Search, Settings, User } from 'lucide-react'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import NotificationDropdown from '@/components/common/NotificationDropdown'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'

export default function Topbar({ onToggleMobile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  useOnClickOutside(menuRef, () => {
    if (showMenu) setShowMenu(false)
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Simple breadcrumb generator based on pathname
  const pathParts = location.pathname.split('/').filter(Boolean)
  const isDashboard = pathParts.length > 0 && pathParts[1] === 'dashboard'

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/50 bg-white/60 px-4 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] sm:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobile}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Breadcrumbs - hidden on mobile */}
        <div className="hidden items-center text-sm font-medium text-slate-500 md:flex">
          <span className="capitalize">{pathParts[0]}</span>
          {pathParts.length > 1 && (
            <>
              <span className="mx-2 text-slate-300">/</span>
              <span className="capitalize text-foreground">{pathParts[1]}</span>
            </>
          )}
        </div>
      </div>

      {/* Global Search - Center (visible on larger screens) */}
      <div className="hidden flex-1 items-center justify-center lg:flex">
        {!isDashboard && (
          <div className="relative w-full max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search anything..."
              className="block w-full rounded-full border bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <kbd className="hidden rounded bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-500 sm:block">⌘K</kbd>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <NotificationDropdown />

        {/* User Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-slate-100 transition-colors"
          >
            <ProfileAvatar name={`${user?.first_name} ${user?.last_name}`} src={user?.avatar} size="sm" />
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold leading-none">{user?.first_name}</p>
            </div>
          </button>

          {showMenu && (
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border bg-white py-2 shadow-xl animate-fade-in-up origin-top-right">
                <div className="px-4 py-2 border-b mb-2">
                  <p className="text-sm font-semibold">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>

                <div className="px-2 space-y-1 border-b pb-2 mb-2">
                  <Link
                    to={user?.role === 'candidate' ? '/candidate/profile' : '/company/profile'}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-slate-100 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    My Profile
                  </Link>
                  <Link
                    to={user?.role === 'candidate' ? '/candidate/settings' : '/company/settings'}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-slate-100 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    Settings
                  </Link>
                </div>

                <div className="px-2">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
          )}
        </div>
      </div>
    </header>
  )
}
