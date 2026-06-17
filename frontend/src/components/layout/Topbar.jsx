import { useState, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Bell, LogOut, Menu, Settings, User, ChevronDown, Zap } from 'lucide-react'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import NotificationDropdown from '@/components/common/NotificationDropdown'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { cn } from '@/lib/utils'

// Human-readable page names from path segments
const PAGE_LABELS = {
  dashboard: 'Dashboard',
  candidates: 'Candidates',
  jobs: 'Jobs',
  messages: 'Messages',
  profile: 'Profile',
  settings: 'Settings',
  team: 'Team',
  pools: 'Talent Pools',
  shortlists: 'Shortlists',
  applications: 'Applications',
  matches: 'AI Matches',
  analytics: 'Analytics',
  companies: 'Companies',
  billing: 'Billing',
}

export default function Topbar({ onToggleMobile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  useOnClickOutside(menuRef, () => { if (showMenu) setShowMenu(false) })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Build breadcrumb
  const pathParts = location.pathname.split('/').filter(Boolean)
  const breadcrumb = pathParts.map((p) => PAGE_LABELS[p] || (p.charAt(0).toUpperCase() + p.slice(1)))

  const getRoleColor = (role) => {
    if (role === 'company_admin') return 'badge-primary'
    if (role === 'recruiter') return 'badge-neutral'
    if (role === 'candidate') return 'badge-success'
    if (role === 'admin') return 'badge-danger'
    return 'badge-neutral'
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-xl sm:px-6">
      {/* Left — Hamburger + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb */}
        <nav className="hidden items-center gap-1.5 text-sm md:flex">
          {breadcrumb.map((segment, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <span className="text-slate-300">/</span>}
              <span className={cn(
                'font-medium',
                idx === breadcrumb.length - 1
                  ? 'text-slate-900'
                  : 'text-slate-400'
              )}>
                {segment}
              </span>
            </div>
          ))}
        </nav>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-2">

        {/* Upgrade pill (free users) */}
        {user && !user.is_pro && (user.role === 'company_admin' || user.role === 'recruiter') && (
          <Link
            to="/pricing"
            className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-amber-400 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:shadow-md hover:scale-105 transition-all sm:flex"
          >
            <Zap className="h-3 w-3" />
            Upgrade
          </Link>
        )}

        {/* Notification bell */}
        <NotificationDropdown />

        {/* User dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 transition-colors"
          >
            <ProfileAvatar name={`${user?.first_name} ${user?.last_name}`} src={user?.avatar} size="sm" />
            <div className="hidden text-left sm:block">
              <p className="text-[13px] font-semibold text-slate-800 leading-tight">{user?.first_name}</p>
            </div>
            <ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition-transform', showMenu && 'rotate-180')} />
          </button>

          {showMenu && (
            <div className="absolute right-0 z-50 mt-2 w-60 rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl shadow-slate-900/10 animate-scale-in origin-top-right">
              {/* User header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                <ProfileAvatar name={`${user?.first_name} ${user?.last_name}`} src={user?.avatar} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`badge text-[10px] ${getRoleColor(user?.role)}`}>
                      {user?.role?.replace('_', ' ')}
                    </span>
                    {user?.is_pro && (
                      <span className="badge badge-pro text-[10px]">Pro</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="px-1.5 py-1.5 border-b border-slate-100">
                <Link
                  to={user?.role === 'candidate' ? '/candidate/profile' : '/company/profile'}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  <User className="h-4 w-4 text-slate-400" />
                  My Profile
                </Link>
                <Link
                  to={user?.role === 'candidate' ? '/candidate/settings' : '/company/settings'}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  <Settings className="h-4 w-4 text-slate-400" />
                  Settings
                </Link>
              </div>

              <div className="px-1.5 py-1.5">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
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
