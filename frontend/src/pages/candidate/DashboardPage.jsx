import { useFetch } from '@/hooks/useFetch'
import { candidatesAPI } from '@/api/candidates'
import { matchingAPI } from '@/api/matching'
import { applicationsAPI } from '@/api/applications'
import { useAuth } from '@/contexts/AuthContext'
import { Briefcase, Sparkles, FileText, CheckCircle, ArrowRight, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import SkeletonCard from '@/components/common/SkeletonCard'

function DashboardStat({ icon: Icon, label, value, trend }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            <TrendingUp className="h-3 w-3 mr-1" /> {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
        <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{value}</p>
      </div>
    </div>
  )
}

export default function CandidateDashboard() {
  const { user } = useAuth()
  const { data: profile, loading: profileLoading } = useFetch(() => candidatesAPI.getProfile())
  const { data: matches } = useFetch(() => matchingAPI.getCandidateMatches())
  const { data: applications } = useFetch(() => applicationsAPI.list())

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  const matchCount = Array.isArray(matches) ? matches.length : 0
  const appCount = Array.isArray(applications) ? applications.length : 0
  const completion = profile?.profile_completion || 0

  return (
    <div className="space-y-8 pb-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 sm:p-10 shadow-lg">
        {/* Background elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome back, {user?.first_name}! 👋</h1>
            <p className="mt-2 text-slate-400 max-w-xl">
              You have {matchCount} new job matches waiting for your review. Complete your profile to boost your visibility to top employers.
            </p>
          </div>
          <div className="shrink-0 flex gap-3">
            <Link to="/candidate/matches" className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/25 hover:bg-primary/90 transition-all">
              View Matches <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Profile strength alert */}
      {completion < 80 && (() => {
        const tiers = [
          { min: 0, label: 'Starter Profile', desc: 'Build your profile to get discovered by top companies.', border: 'border-red-200', bg: 'from-red-50 to-orange-50', stroke: 'stroke-red-500', strokeBg: 'stroke-red-200', text: 'text-red-700', btnBg: 'bg-red-500 hover:bg-red-600' },
          { min: 31, label: 'Growing Profile', desc: 'Great start! Add more details to boost visibility.', border: 'border-amber-200', bg: 'from-amber-50 to-orange-50', stroke: 'stroke-amber-500', strokeBg: 'stroke-amber-200', text: 'text-amber-700', btnBg: 'bg-amber-500 hover:bg-amber-600' },
          { min: 61, label: 'Strong Profile', desc: 'Almost there! A few more details and you\'re outstanding.', border: 'border-blue-200', bg: 'from-blue-50 to-indigo-50', stroke: 'stroke-blue-500', strokeBg: 'stroke-blue-200', text: 'text-blue-700', btnBg: 'bg-blue-500 hover:bg-blue-600' },
        ]
        const tier = [...tiers].reverse().find(t => completion >= t.min) || tiers[0]
        return (
          <div className={`flex flex-col gap-4 rounded-2xl border ${tier.border} bg-gradient-to-r ${tier.bg} p-5 sm:flex-row sm:items-center sm:justify-between shadow-sm`}>
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center shrink-0">
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path className={tier.strokeBg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
                  <path className={`${tier.stroke} transition-all duration-1000`} strokeDasharray={`${completion}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
                </svg>
                <span className={`text-xs font-bold ${tier.text}`}>{completion}%</span>
              </div>
              <div>
                <p className={`font-semibold ${tier.text}`}>{tier.label}</p>
                <p className={`text-sm ${tier.text} opacity-80 mt-0.5`}>{tier.desc}</p>
              </div>
            </div>
            <Link to="/candidate/profile" className={`shrink-0 rounded-full ${tier.btnBg} px-5 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm`}>
              Complete Profile
            </Link>
          </div>
        )
      })()}

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStat icon={Sparkles} label="AI Job Matches" value={matchCount} trend="+3 this week" />
        <DashboardStat icon={FileText} label="Active Applications" value={appCount} />
        <DashboardStat icon={CheckCircle} label="Profile Score" value={`${completion}%`} />
        <DashboardStat icon={Briefcase} label="Current Status" value={profile?.employment_status?.replace('_', ' ') || 'N/A'} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Area (Matches) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Top Recommended Matches</h2>
            <Link to="/candidate/matches" className="text-sm font-semibold text-primary hover:underline">View all matches</Link>
          </div>

          <div className="grid gap-4">
            {Array.isArray(matches) && matches.length > 0 ? matches.slice(0, 3).map((match) => (
              <div key={match.id} className="group relative flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30 sm:flex-row sm:items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                    <Link to={`/candidate/jobs/${match.job}`} className="hover:underline">{match.job_title}</Link>
                  </h3>
                  <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-medium text-slate-700">{match.company_name}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{match.job?.is_remote || 'On-site'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Sparkles className="h-4 w-4 text-ai" />
                      <span className="text-lg font-bold text-ai">
                        {Math.round(match.overall_score)}%
                      </span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Match Score</span>
                  </div>
                  <Link to={`/candidate/jobs/${match.job}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors group-hover:bg-primary group-hover:text-white">
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center bg-slate-50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200/50 mb-4">
                  <Sparkles className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold">No matches yet</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                  Complete your profile skills and experience to help our AI find the perfect roles for you.
                </p>
                <Link to="/candidate/profile" className="mt-6 rounded-full bg-white px-6 py-2 text-sm font-semibold border shadow-sm hover:bg-slate-50 transition-colors">
                  Update Profile
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Activity */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight">Recent Activity</h2>

          <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b bg-slate-50/50">
              <h3 className="font-semibold">Application Status</h3>
            </div>
            <div className="divide-y p-5">
              {Array.isArray(applications) && applications.length > 0 ? applications.slice(0, 4).map(app => (
                <div key={app.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="font-medium text-sm truncate">{app.job_title}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{app.company_name}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                      {app.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No active applications.
                </div>
              )}
            </div>
            <div className="p-3 border-t bg-slate-50/50">
              <Link to="/candidate/applications" className="block text-center text-xs font-semibold text-primary hover:underline">
                View all applications
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
