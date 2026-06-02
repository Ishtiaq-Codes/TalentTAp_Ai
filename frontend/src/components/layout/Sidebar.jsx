import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/common/Logo'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, User, Briefcase, Search, FileText, Heart,
  MessageSquare, Building2, Users, Settings, BarChart3, Sparkles,
} from 'lucide-react'

const candidateLinks = [
  { to: '/candidate/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/candidate/profile', icon: User, label: 'Profile' },
  { to: '/candidate/jobs', icon: Briefcase, label: 'Browse Jobs' },
  { to: '/candidate/applications', icon: FileText, label: 'Applications' },
  { to: '/candidate/matches', icon: Sparkles, label: 'Matches' },
  { to: '/candidate/messages', icon: MessageSquare, label: 'Messages' },
]

const recruiterLinks = [
  { to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/recruiter/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/recruiter/candidates', icon: Search, label: 'Find Candidates' },
  { to: '/recruiter/shortlists', icon: Heart, label: 'Shortlists' },
  { to: '/recruiter/messages', icon: MessageSquare, label: 'Messages' },
]

const companyLinks = [
  { to: '/company/profile', icon: Building2, label: 'Company' },
  { to: '/company/team', icon: Users, label: 'Team' },
  { to: '/company/settings', icon: Settings, label: 'Settings' },
]

const adminLinks = [
  { to: '/admin/dashboard', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/companies', icon: Building2, label: 'Companies' },
  { to: '/admin/candidates', icon: Users, label: 'Candidates' },
  { to: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
]

export default function Sidebar() {
  const { user } = useAuth()

  const getLinks = () => {
    switch (user?.role) {
      case 'candidate': return candidateLinks
      case 'recruiter': return recruiterLinks
      case 'company_admin': return [...recruiterLinks, ...companyLinks]
      case 'admin': return adminLinks
      default: return []
    }
  }

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {getLinks().map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
