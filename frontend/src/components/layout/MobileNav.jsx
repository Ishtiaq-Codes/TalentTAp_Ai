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
        { to: '/company/pools', icon: Sparkles, label: 'Talent Pools' },
      ]
    },
    {
      section: 'Company', items: [
        { to: '/company/profile', icon: Building2, label: 'Company Profile' },
        { to: '/company/settings', icon: Settings, label: 'Settings' },
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

      {/* Sliding Panel — obsidian theme to match desktop sidebar */}
      <div className="fixed inset-y-0 left-0 w-[280px] bg-[hsl(224,60%,8%)] shadow-2xl animate-slide-in-left overflow-y-auto flex flex-col border-r border-white/5">
        <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/5 bg-[hsl(224,60%,8%)] px-5">
          <Logo theme="dark" />
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-white/10 hover:text-slate-300 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-8">
          {sections.map((section, idx) => (
            <div key={idx}>
              <h4 className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                {section.section}
              </h4>
              <div className="space-y-1">
                {section.items.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) => cn(
                      'sidebar-nav-item',
                      isActive && 'active'
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <div className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0',
                          isActive ? 'bg-violet-500/20 text-violet-400' : 'text-slate-600'
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-[13.5px]">{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Info bottom */}
        <div className="border-t border-white/5 p-4 mt-auto">
          <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/5 transition-colors">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white flex-shrink-0">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-[13px] font-semibold text-white leading-tight">{user?.first_name} {user?.last_name}</p>
              <p className="truncate text-[11px] text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
