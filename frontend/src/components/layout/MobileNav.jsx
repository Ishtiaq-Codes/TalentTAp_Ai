import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/common/Logo'
import { cn } from '@/lib/utils'
import {
  X, LayoutDashboard, User, Briefcase, Search, FileText,
  Heart, MessageSquare, Building2, Users, Settings, BarChart3, Sparkles
} from 'lucide-react'

const allLinks = {
  candidate: [
    {
      section: 'Dashboard', items: [
        { to: '/candidate/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { to: '/candidate/matches', icon: Sparkles, label: 'AI Matches' },
      ]
    },
    {
      section: 'Job Search', items: [
        { to: '/candidate/jobs', icon: Briefcase, label: 'Browse Jobs' },
        { to: '/candidate/applications', icon: FileText, label: 'Applications' },
        { to: '/candidate/messages', icon: MessageSquare, label: 'Messages' },
      ]
    },
    {
      section: 'Settings', items: [
        { to: '/candidate/profile', icon: User, label: 'My Profile' },
        { to: '/candidate/settings', icon: Settings, label: 'Settings' },
      ]
    }
  ],
  recruiter: [
    {
      section: 'Dashboard', items: [
        { to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { to: '/recruiter/jobs', icon: Briefcase, label: 'Manage Jobs' },
      ]
    },
    {
      section: 'Talent Discovery', items: [
        { to: '/recruiter/candidates', icon: Search, label: 'Search Candidates' },
        { to: '/recruiter/shortlists', icon: Heart, label: 'Shortlists' },
        { to: '/recruiter/messages', icon: MessageSquare, label: 'Messages' },
      ]
    }
  ],
  company_admin: [
    {
      section: 'Dashboard', items: [
        { to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { to: '/recruiter/jobs', icon: Briefcase, label: 'Manage Jobs' },
      ]
    },
    {
      section: 'Talent Discovery', items: [
        { to: '/recruiter/candidates', icon: Search, label: 'Search Candidates' },
        { to: '/recruiter/shortlists', icon: Heart, label: 'Shortlists' },
        { to: '/recruiter/messages', icon: MessageSquare, label: 'Messages' },
      ]
    },
    {
      section: 'Organization', items: [
        { to: '/company/profile', icon: Building2, label: 'Company Profile' },
        { to: '/company/team', icon: Users, label: 'Team Members' },
        { to: '/company/settings', icon: Settings, label: 'Settings' },
      ]
    }
  ],
  admin: [
    {
      section: 'Platform', items: [
        { to: '/admin/dashboard', icon: BarChart3, label: 'Analytics' },
        { to: '/admin/companies', icon: Building2, label: 'Companies' },
        { to: '/admin/candidates', icon: Users, label: 'Candidates' },
        { to: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
      ]
    }
  ],
}

export default function MobileNav({ open, onClose }) {
  const { user } = useAuth()
  const sections = allLinks[user?.role] || []

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sliding Panel */}
      <div className="fixed inset-y-0 left-0 w-[280px] bg-white shadow-2xl animate-slide-in-right origin-left overflow-y-auto flex flex-col">
        <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white/95 px-5 backdrop-blur-md">
          <Logo />
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-8">
          {sections.map((section, idx) => (
            <div key={idx}>
              <h4 className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                {section.section}
              </h4>
              <div className="space-y-1">
                {section.items.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) => cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <div className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                          isActive ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'text-slate-400 group-hover:text-primary'
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {label}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Info bottom */}
        <div className="border-t p-4 mt-auto">
          <div className="flex items-center gap-3 rounded-xl p-2 bg-slate-50 border">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-blue-200 text-xs font-bold text-primary">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold">{user?.first_name} {user?.last_name}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
