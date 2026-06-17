import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/common/Logo'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, User, Briefcase, Search, FileText, Heart,
  MessageSquare, Building2, Users, Settings, BarChart3, Sparkles,
  Shield, CreditCard, ChevronRight, Zap
} from 'lucide-react'
import ProfileAvatar from '@/components/common/ProfileAvatar'

const candidateLinks = [
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
    section: 'Account', items: [
      { to: '/candidate/profile', icon: User, label: 'My Profile' },
      { to: '/candidate/settings', icon: Settings, label: 'Settings' },
    ]
  }
]

const recruiterLinks = [
  {
    section: 'Dashboard', items: [
      { to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Overview' },
      { to: '/recruiter/jobs', icon: Briefcase, label: 'Manage Jobs' },
    ]
  },
  {
    section: 'Talent', items: [
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
      { to: '/pricing', icon: CreditCard, label: 'Subscription' },
    ]
  }
]

const companyAdminLinks = [
  {
    section: 'Command Center', items: [
      { to: '/company/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]
  },
  {
    section: 'Talent Discovery', items: [
      { to: '/recruiter/jobs', icon: Briefcase, label: 'Jobs' },
      { to: '/recruiter/candidates', icon: Search, label: 'Search Candidates' },
      { to: '/recruiter/shortlists', icon: Heart, label: 'Shortlists' },
      { to: '/recruiter/messages', icon: MessageSquare, label: 'Messages' },
      { to: '/company/pools', icon: Sparkles, label: 'Talent Pools' },
    ]
  },
  {
    section: 'Company', items: [
      { to: '/company/profile', icon: Building2, label: 'Company Profile' },
      { to: '/company/team', icon: Users, label: 'Team Members' },
      { to: '/company/settings', icon: Settings, label: 'Settings' },
      { to: '/pricing', icon: CreditCard, label: 'Subscription' },
    ]
  }
]

const adminLinks = [
  {
    section: 'Platform', items: [
      { to: '/admin/dashboard', icon: BarChart3, label: 'Analytics' },
      { to: '/admin/companies', icon: Building2, label: 'Companies' },
      { to: '/admin/candidates', icon: Users, label: 'Candidates' },
      { to: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
    ]
  }
]

export default function Sidebar() {
  const { user } = useAuth()

  const getNavSections = () => {
    switch (user?.role) {
      case 'candidate': return candidateLinks
      case 'recruiter': return recruiterLinks
      case 'company_admin': return companyAdminLinks
      case 'admin': return adminLinks
      default: return []
    }
  }

  const sections = getNavSections()
  const roleLabel = user?.role?.replace('_', ' ') || 'User'

  return (
    <aside className="hidden lg:flex w-[248px] flex-col bg-[hsl(224,60%,8%)] text-slate-400 shadow-2xl border-r border-white/5 flex-shrink-0">
      {/* Logo Area */}
      <div className="flex h-16 items-center px-5 border-b border-white/5">
        <Logo theme="dark" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 no-scrollbar">
        {sections.map((section, idx) => (
          <div key={idx}>
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
              {section.section}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => cn(
                    'sidebar-nav-item',
                    isActive && 'active'
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <div className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0 transition-colors',
                        isActive
                          ? 'bg-violet-500/20 text-violet-400'
                          : 'text-slate-600 group-hover:text-slate-400'
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="flex-1 text-[13.5px]">{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Upgrade Banner (for free tier) */}
      {user && !user.is_pro && (user.role === 'company_admin' || user.role === 'recruiter') && (
        <div className="px-3 pb-3">
          <Link
            to="/pricing"
            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-amber-500/10 border border-violet-500/20 hover:border-violet-500/40 transition-all group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-amber-400 flex-shrink-0">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white leading-tight">Upgrade to Pro</p>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Unlock AI features</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-violet-400 transition-colors" />
          </Link>
        </div>
      )}

      {/* User Profile Footer */}
      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-white/5 transition-colors cursor-default">
          <ProfileAvatar
            name={`${user?.first_name} ${user?.last_name}`}
            src={user?.avatar}
            size="md"
          />
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-[13px] font-semibold text-white leading-tight">
              {user?.first_name} {user?.last_name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="truncate text-[11px] text-slate-500 capitalize">{roleLabel}</p>
              {user?.is_pro && (
                <span className="inline-flex items-center rounded-full bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-bold text-violet-400 border border-violet-500/20">
                  PRO
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
