import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useFetch } from '@/hooks/useFetch'
import { jobsAPI } from '@/api/jobs'
import { matchingAPI } from '@/api/matching'
import { applicationsAPI } from '@/api/applications'
import MatchScoreBadge from '@/components/common/MatchScoreBadge'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import SkeletonCard from '@/components/common/SkeletonCard'
import ShortlistButton from '@/components/common/ShortlistButton'
import MessageButton from '@/components/common/MessageButton'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Sparkles, Users, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function JobDetailPage() {
  const { id } = useParams()
  const { data: job, loading } = useFetch(() => jobsAPI.get(id), [id])
  const { data: matches, loading: matchLoading, refetch: refetchMatches } = useFetch(() => matchingAPI.getJobResults(id), [id])
  const { data: applications } = useFetch(() => applicationsAPI.list({ job: id }), [id])
  const [runningMatch, setRunningMatch] = useState(false)
  const [tab, setTab] = useState('matches')

  const runMatch = async () => {
    setRunningMatch(true)
    try {
      await matchingAPI.runForJob(id)
      refetchMatches()
    } catch { }
    setRunningMatch(false)
  }

  if (loading) return <div className="space-y-4">{[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}</div>
  if (!job) return <p>Job not found</p>

  const matchList = Array.isArray(matches) ? matches : []
  const appList = Array.isArray(applications) ? applications : []

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/recruiter/jobs" className="rounded-lg p-2 hover:bg-muted self-start mt-1 shrink-0"><ArrowLeft className="h-5 w-5" /></Link>
        <ProfileAvatar src={job.company_logo} name={job.company_name} size="xl" className="rounded-2xl border border-slate-100 shadow-sm shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold truncate">{job.title}</h1>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${job.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
              }`}>{job.status}</span>
          </div>
          <p className="text-muted-foreground truncate">{job.company_name} · {job.employment_type?.replace('_', ' ')} · {job.is_remote} · {job.city || job.country}</p>
        </div>
      </div>

      {/* Job description */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold">Description</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{job.description}</p>
        {job.skills?.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium">Required Skills</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {job.skills.map(s => (
                <span key={s.id} className={`rounded-full px-3 py-1 text-xs ${s.is_required ? 'bg-primary/10 text-primary font-medium' : 'bg-muted text-muted-foreground'}`}>
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button onClick={() => setTab('matches')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === 'matches' ? 'bg-card shadow-sm' : 'hover:bg-card/50'}`}>
          <Sparkles className="mr-1.5 inline h-4 w-4" /> AI Matches ({matchList.length})
        </button>
        <button onClick={() => setTab('applications')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === 'applications' ? 'bg-card shadow-sm' : 'hover:bg-card/50'}`}>
          <Users className="mr-1.5 inline h-4 w-4" /> Applications ({appList.length})
        </button>
      </div>

      {/* Tab content */}
      {tab === 'matches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{matchList.length} candidates ranked by AI score</p>
            <button onClick={runMatch} disabled={runningMatch}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${runningMatch ? 'animate-spin' : ''}`} /> {runningMatch ? 'Running...' : 'Re-run AI'}
            </button>
          </div>
          {matchList.map((match) => (
            <div key={match.id} className="flex items-center gap-5 rounded-xl border bg-card p-5 hover:shadow-md transition-shadow">
              <MatchScoreBadge score={match.overall_score} />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{match.candidate_name}</p>
                    <p className="text-sm text-muted-foreground">{match.candidate_headline}</p>
                  </div>
                  <div className="flex gap-2">
                    <MessageButton recipientId={match.candidate_user_id} name={match.candidate_name} />
                    <ShortlistButton candidateId={match.candidate_id} jobId={job.id} />
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {['Skills', 'Experience', 'Location', 'Availability', 'Type'].map((label, i) => {
                    const scores = [match.skill_score, match.experience_score, match.location_score, match.availability_score, match.employment_type_score]
                    return (
                      <div key={label} className="text-center">
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${scores[i] || 0}%` }} />
                        </div>
                        <p className="mt-1 text-[10px] text-muted-foreground">{label}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'applications' && (
        <div className="space-y-3">
          {appList.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No applications yet.</p>
          ) : appList.map((app) => (
            <div key={app.id} className="flex items-center justify-between rounded-xl border bg-card p-5">
              <div className="flex items-center gap-3">
                <ProfileAvatar name={app.candidate_name} size="sm" />
                <div>
                  <p className="font-medium text-sm">{app.candidate_name}</p>
                  <p className="text-xs text-muted-foreground">Applied {formatDate(app.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MessageButton recipientId={app.candidate_user_id} name={app.candidate_name} />
                <ShortlistButton candidateId={app.candidate} jobId={job.id} />
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 capitalize">{app.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
