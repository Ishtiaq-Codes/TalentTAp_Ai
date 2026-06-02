import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import { Bell, LogOut, Menu, X } from 'lucide-react'

export default function Topbar({ onToggleMobile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
      <button onClick={onToggleMobile} className="lg:hidden" aria-label="Toggle menu">
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(user?.role === 'candidate' ? '/candidate/messages' : '/recruiter/messages')}
          className="relative rounded-lg p-2 hover:bg-muted"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2">
            <ProfileAvatar name={user?.full_name} src={user?.avatar} size="sm" />
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium">{user?.full_name}</p>
              <p className="text-xs capitalize text-muted-foreground">{user?.role?.replace('_', ' ')}</p>
            </div>
          </button>

          {showMenu && (
            <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border bg-card py-1 shadow-lg">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-muted"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
