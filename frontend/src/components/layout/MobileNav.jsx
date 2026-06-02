import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/common/Logo'
import { cn } from '@/lib/utils'
import { X, LayoutDashboard, User, Briefcase, Search, FileText, Heart, MessageSquare, Building2, Users, Settings, BarChart3, Sparkles } from 'lucide-react'

const allLinks = {
  candidate: [
    { to: '/candidate/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/candidate/profile', icon: User, label: 'Profile' },
    { to: '/candidate/jobs', icon: Briefcase, label: 'Browse Jobs' },
    { to: '/candidate/applications', icon: FileText, label: 'Applications' },
    { to: '/candidate/matches', icon: Sparkles, label: 'Matches' },
    { to: '/candidate/messages', icon: MessageSquare, label: 'Messages' },
  ],
  recruiter: [
    { to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/recruiter/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/recruiter/candidates', icon: Search, label: 'Find Candidates' },
    { to: '/recruiter/shortlists', icon: Heart, label: 'Shortlists' },
    { to: '/recruiter/messages', icon: MessageSquare, label: 'Messages' },
  ],
  company_admin: [
    { to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/recruiter/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/recruiter/candidates', icon: Search, label: 'Find Candidates' },
    { to: '/company/profile', icon: Building2, label: 'Company' },
    { to: '/company/team', icon: Users, label: 'Team' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/companies', icon: Building2, label: 'Companies' },
    { to: '/admin/candidates', icon: Users, label: 'Candidates' },
    { to: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
  ],
}

export default function MobileNav({ open, onClose }) {
  const { user } = useAuth()
  const links = allLinks[user?.role] || []

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-72 bg-card shadow-xl">
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Logo />
          <button onClick={onClose} aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
