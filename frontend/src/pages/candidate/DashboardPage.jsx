import { useFetch } from '@/hooks/useFetch'
import { candidatesAPI } from '@/api/candidates'
import { matchingAPI } from '@/api/matching'
import { applicationsAPI } from '@/api/applications'
import { useAuth } from '@/contexts/AuthContext'
import StatCard from '@/components/common/StatCard'
import SkeletonCard from '@/components/common/SkeletonCard'
import { Briefcase, Sparkles, FileText, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

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
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.first_name}! 👋</h1>
        <p className="text-muted-foreground">Here's what's happening with your job search.</p>
      </div>

      {/* Profile completion alert */}
      {completion < 80 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-amber-800">Complete your profile ({completion}%)</p>
              <p className="text-sm text-amber-600">A complete profile gets 3x more matches.</p>
            </div>
            <Link to="/candidate/profile"
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
              Complete Now
            </Link>
          </div>
          <div className="mt-3 h-2 rounded-full bg-amber-200">
            <div className="h-2 rounded-full bg-amber-600 transition-all" style={{ width: `${completion}%` }} />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Sparkles} label="Job Matches" value={matchCount} />
        <StatCard icon={FileText} label="Applications" value={appCount} />
        <StatCard icon={CheckCircle} label="Profile Score" value={`${completion}%`} />
        <StatCard icon={Briefcase} label="Status" value={profile?.employment_status?.replace('_', ' ') || 'N/A'} />
      </div>

      {/* Recent matches */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold">Recent Matches</h2>
          <Link to="/candidate/matches" className="text-sm text-primary hover:underline">View All</Link>
        </div>
        <div className="divide-y">
          {Array.isArray(matches) && matches.length > 0 ? matches.slice(0, 5).map((match) => (
            <div key={match.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{match.job_title}</p>
                <p className="text-sm text-muted-foreground">{match.company_name}</p>
              </div>
              <span className={`text-sm font-bold ${match.overall_score >= 80 ? 'text-emerald-600' : match.overall_score >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                {Math.round(match.overall_score)}% match
              </span>
            </div>
          )) : (
            <div className="p-8 text-center text-sm text-muted-foreground">No matches yet. Complete your profile to get matched!</div>
          )}
        </div>
      </div>
    </div>
  )
}
