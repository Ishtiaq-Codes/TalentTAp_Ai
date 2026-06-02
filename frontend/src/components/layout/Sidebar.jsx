import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/common/Logo'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, User, Briefcase, Search, FileText, Heart,
  MessageSquare, Building2, Users, Settings, BarChart3, Sparkles,
} from 'lucide-react'
import ProfileAvatar from '@/components/common/ProfileAvatar'

const candidateLinks = [
  { section: 'Dashboard', items: [
    { to: '/candidate/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/candidate/matches', icon: Sparkles, label: 'AI Matches' },
  ]},
  { section: 'Job Search', items: [
    { to: '/candidate/jobs', icon: Briefcase, label: 'Browse Jobs' },
    { to: '/candidate/applications', icon: FileText, label: 'Applications' },
    { to: '/candidate/messages', icon: MessageSquare, label: 'Messages' },
  ]},
  { section: 'Settings', items: [
    { to: '/candidate/profile', icon: User, label: 'My Profile' },
  ]}
]

const recruiterLinks = [
  { section: 'Dashboard', items: [
    { to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/recruiter/jobs', icon: Briefcase, label: 'Manage Jobs' },
  ]},
  { section: 'Talent Discovery', items: [
    { to: '/recruiter/candidates', icon: Search, label: 'Search Candidates' },
    { to: '/recruiter/shortlists', icon: Heart, label: 'Shortlists' },
    { to: '/recruiter/messages', icon: MessageSquare, label: 'Messages' },
  ]}
]

const companyLinks = [
  { section: 'Organization', items: [
    { to: '/company/profile', icon: Building2, label: 'Company Profile' },
    { to: '/company/team', icon: Users, label: 'Team Members' },
    { to: '/company/settings', icon: Settings, label: 'Settings' },
  ]}
]

const adminLinks = [
  { section: 'Platform', items: [
    { to: '/admin/dashboard', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/companies', icon: Building2, label: 'Companies' },
    { to: '/admin/candidates', icon: Users, label: 'Candidates' },
    { to: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
  ]}
]

export default function Sidebar() {
  const { user } = useAuth()

  const getNavSections = () => {
    switch (user?.role) {
      case 'candidate': return candidateLinks
      case 'recruiter': return recruiterLinks
      case 'company_admin': return [...recruiterLinks, ...companyLinks]
      case 'admin': return adminLinks
      default: return []
    }
  }

  const sections = getNavSections()

  return (
    <aside className="hidden lg:flex w-[260px] flex-col border-r bg-white">
      {/* Logo Area */}
      <div className="flex h-16 items-center px-6 border-b">
        <Logo />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
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
                  className={({ isActive }) => cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <div className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-lg transition-colors',
                        isActive ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'text-slate-400 group-hover:text-primary'
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {label}
                      {/* Active indicator dot */}
                      {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Quick Profile Area */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50">
          <ProfileAvatar name={`${user?.first_name} ${user?.last_name}`} src={user?.avatar} size="md" />
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold">{user?.first_name} {user?.last_name}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
