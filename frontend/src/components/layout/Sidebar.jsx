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
    section: 'Talent Discovery', items: [
      { to: '/recruiter/candidates', icon: Search, label: 'Search Candidates' },
      { to: '/recruiter/shortlists', icon: Heart, label: 'Shortlists' },
      { to: '/recruiter/messages', icon: MessageSquare, label: 'Messages' },
    ]
  }
]

const companyLinks = [
  {
    section: 'Organization', items: [
      { to: '/company/profile', icon: Building2, label: 'Company Profile' },
      { to: '/company/team', icon: Users, label: 'Team Members' },
      { to: '/company/settings', icon: Settings, label: 'Settings' },
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
      case 'company_admin': return [...recruiterLinks, ...companyLinks]
      case 'admin': return adminLinks
      default: return []
    }
  }

  const sections = getNavSections()

  return (
    <aside className="hidden lg:flex w-[260px] flex-col border-r border-[#1f2937] bg-[#0B1220] text-slate-300">
      {/* Logo Area */}
      <div className="flex h-16 items-center px-6 border-b border-[#1f2937]">
        {/* Force logo to be white or light mode compatible if it's an SVG. Assuming Logo component handles it or we wrap it */}
        <div className="text-white">
          <Logo />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-8">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h4 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {section.section}
            </h4>
            <div className="space-y-0.5">
              {section.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-[#1f2937]/50 text-white shadow-sm'
                      : 'text-slate-400 hover:bg-[#1f2937]/30 hover:text-slate-200',
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <div className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-md transition-colors',
                        isActive ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'
                      )}>
                        <Icon className="h-[18px] w-[18px] stroke-[2]" />
                      </div>
                      {label}
                      {/* Active indicator dot */}
                      {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(37,99,235,0.8)]" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Quick Profile Area */}
      <div className="border-t border-[#1f2937] p-3">
        <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-[#1f2937]/50 cursor-pointer">
          <ProfileAvatar name={`${user?.first_name} ${user?.last_name}`} src={user?.avatar} size="sm" />
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-slate-200">{user?.first_name} {user?.last_name}</p>
            <p className="truncate text-[11px] text-slate-500 capitalize font-medium">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
