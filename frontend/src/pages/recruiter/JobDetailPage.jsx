import { useState, useEffect } from 'react'
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
import ConfirmModal from '@/components/common/ConfirmModal'
import { ArrowLeft, Sparkles, Users, RefreshCw, ExternalLink, Edit2, Trash2, Repeat } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '@/contexts/ToastContext'

export default function JobDetailPage() {
 const { id } = useParams()
 const { data: job, loading } = useFetch(() => jobsAPI.get(id), [id])
 const { data: matches, loading: matchLoading, refetch: refetchMatches } = useFetch(() => matchingAPI.getJobResults(id), [id])
 const { data: applications } = useFetch(() => applicationsAPI.list({ job: id }), [id])
 const { data: shortlists } = useFetch(() => applicationsAPI.getShortlists())
 const [runningMatch, setRunningMatch] = useState(false)
 const [tab, setTab] = useState('matches')
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
 
 const navigate = useNavigate()
 const { success, error: showError } = useToast()

 const runMatch = async () => {
  setRunningMatch(true)
  try {
   await matchingAPI.runForJob(id)
   refetchMatches()
  } catch { }
  setRunningMatch(false)
 }

 // Auto-run AI matching in the background when opening the job
 // This ensures candidates are always populated without requiring a manual click
 useEffect(() => {
  if (id && job?.status === 'active') {
   matchingAPI.runForJob(id).then(() => {
    refetchMatches()
   }).catch(console.error)
  }
 }, [id, job?.status, refetchMatches])

 if (loading) return <div className="space-y-4">{[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}</div>
 if (!job) return <p>Job not found</p>

 const matchList = Array.isArray(matches) ? matches : []
 const appList = Array.isArray(applications) 
  ? Array.from(new Map(applications.map(app => [app.candidate, app])).values()) 
  : []
 const shortlistsArray = Array.isArray(shortlists) ? shortlists : []

 const handleDelete = async () => {
  try {
   await jobsAPI.delete(id)
   success('Job deleted successfully')
   navigate('/recruiter/jobs')
  } catch (err) {
   showError('Failed to delete job')
  }
 }

 const handleRepost = async () => {
  try {
   await jobsAPI.repost(id)
   success('Job reposted successfully')
   window.location.reload()
  } catch (err) {
   showError('Failed to repost job')
  }
 }

 return (
  <div className="mx-auto max-w-4xl space-y-6">
   <div className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-4 flex-1 min-w-0">
     <Link to="/recruiter/jobs"className="rounded-lg p-2 hover:bg-muted self-start mt-1 shrink-0"><ArrowLeft className="h-5 w-5"/></Link>
     <ProfileAvatar src={job.company_logo} name={job.company_name} size="xl"className="rounded-2xl border border-slate-100 shadow-sm shrink-0"/>
     <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3 mb-1">
       <h1 className="text-2xl font-bold truncate">{job.title}</h1>
       <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${job.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
        }`}>{job.status}</span>
      </div>
      <p className="text-muted-foreground truncate">{job.company_name} · {job.employment_type?.replace('_', ' ')} · {job.is_remote} · {job.city || job.country}</p>
     </div>
    </div>
    
    <div className="flex items-center gap-2 shrink-0">
     {(job.status === 'closed' || job.status === 'archived') && (
      <button onClick={handleRepost} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
       <Repeat className="h-4 w-4"/> Repost
      </button>
     )}
     <button onClick={() => navigate(`/recruiter/jobs/${id}/edit`)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
      <Edit2 className="h-4 w-4"/> Edit
     </button>
     <button onClick={() => setIsDeleteModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors shadow-sm">
      <Trash2 className="h-4 w-4"/> Delete
     </button>
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

   {/* Tabs and Content */}
   {job.status === 'draft' ? (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-slate-50 p-12 text-center">
     <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200/50 text-slate-500">
      <Sparkles className="h-6 w-6"/>
     </div>
     <h3 className="text-lg font-bold text-slate-900">Publish to view AI matches</h3>
     <p className="mt-2 text-sm text-slate-500 max-w-sm">
      Once this job is published and becomes active, our AI engine will automatically scan the talent pool to find the best candidates.
     </p>
    </div>
   ) : (
    <>
     <div className="flex gap-1 rounded-lg bg-muted p-1">
      <button onClick={() => setTab('matches')}
       className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === 'matches' ? 'bg-card shadow-sm' : 'hover:bg-card/50'}`}>
       <Sparkles className="mr-1.5 inline h-4 w-4"/> AI Matches ({matchList.length})
      </button>
      <button onClick={() => setTab('applications')}
       className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === 'applications' ? 'bg-card shadow-sm' : 'hover:bg-card/50'}`}>
       <Users className="mr-1.5 inline h-4 w-4"/> Applications ({appList.length})
      </button>
     </div>

     {tab === 'matches' && (
      <div className="space-y-4">
       {/* Premium AI Explanation Box */}
       <div className="relative overflow-hidden rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50 p-4 shadow-sm">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/10 to-blue-500/10 blur-2xl"/>
        <div className="flex items-start gap-3 relative z-10">
         <div className="mt-0.5 rounded-lg bg-indigo-100 p-1.5 text-indigo-600 shadow-sm">
          <Sparkles className="h-4 w-4"/>
         </div>
         <div>
          <h4 className="text-sm font-semibold text-slate-900">How AI Matching Works</h4>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 max-w-[90%]">
           Our engine computes an exact match score out of 100% by analyzing 5 strict dimensions: 
           <span className="font-medium text-slate-700"> Skills, Semantic Experience, Location, Availability, and Employment Type. </span>
           Candidates scoring below 60% are automatically filtered out to ensure you only see highly qualified talent.
          </p>
         </div>
        </div>
       </div>

       <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{matchList.length} candidates ranked by AI score</p>
        {job.status === 'active' && (
         <button onClick={runMatch} disabled={runningMatch}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${runningMatch ? 'animate-spin' : ''}`} /> {runningMatch ? 'Running...' : 'Re-run AI'}
         </button>
        )}
       </div>
     {matchList.map((match) => (
      <div key={match.id} className="flex items-center gap-5 rounded-xl border bg-card p-5 hover:shadow-md transition-shadow">
       <ProfileAvatar src={match.candidate_avatar} name={match.candidate_name} size="xl"className="shrink-0"/>
       <div className="flex-1">
        <div className="flex items-start justify-between">
         <Link to={`/recruiter/candidates/${match.candidate_id}?job_id=${job.id}`} className="flex items-center gap-3 group">
          <div>
           <div className="flex items-center gap-2">
            <p className="font-semibold group-hover:text-primary transition-colors">{match.candidate_name}</p>
            <div className="flex items-center gap-1.5 ml-2">
             <span className="text-[10px] font-bold uppercase tracking-widest text-ai opacity-80 mt-0.5">AI Match</span>
             <MatchScoreBadge score={match.overall_score} size="sm"/>
            </div>
           </div>
           <p className="text-sm text-muted-foreground">{match.candidate_headline}</p>
           {match.match_explainer && (
            <div className="mt-1.5 flex items-center gap-1.5">
             <Sparkles className="h-3 w-3 text-ai shrink-0"/>
             <p className="text-xs font-medium text-slate-600">{match.match_explainer}</p>
            </div>
           )}
          </div>
         </Link>
         <div className="flex gap-2">
          <Link
           to={`/recruiter/candidates/${match.candidate_id}?job_id=${job.id}`}
           className="flex items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
           <ExternalLink className="h-4 w-4"/> Profile
          </Link>
          <MessageButton recipientId={match.candidate_user_id} name={match.candidate_name} />
          <ShortlistButton 
           candidateId={match.candidate_id} 
           jobId={job.id} 
           initialIsShortlisted={shortlistsArray.some(s => s.candidate === match.candidate_id)}
          />
         </div>
        </div>
        <div className="mt-2 grid grid-cols-5 gap-2">
         {['Skills', 'Experience', 'Location', 'Availability', 'Type'].map((label, i) => {
          const scores = [match.skill_score, match.experience_score, match.location_score, match.availability_score, match.employment_type_score]
          return (
           <div key={label} className="text-center">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
             <div className="h-full rounded-full bg-primary"style={{ width: `${scores[i] || 0}%` }} />
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
      <div key={app.id} className="flex flex-col gap-4 rounded-xl border bg-card p-5">
       <div className="flex items-center justify-between">
        <Link to={`/recruiter/candidates/${app.candidate}?job_id=${job.id}`} className="flex items-center gap-3 group">
         <ProfileAvatar src={app.candidate_avatar} name={app.candidate_name} size="md"/>
         <div>
          <p className="font-medium text-sm group-hover:text-primary transition-colors">{app.candidate_name}</p>
          <p className="text-xs text-muted-foreground">Applied {formatDate(app.created_at)}</p>
         </div>
        </Link>
        <div className="flex items-center gap-2">
         <Link
          to={`/recruiter/candidates/${app.candidate}?job_id=${job.id}`}
          className="flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors h-10"
         >
          <ExternalLink className="h-4 w-4"/> Profile
         </Link>
         <MessageButton recipientId={app.candidate_user_id} name={app.candidate_name} />
         <ShortlistButton 
          candidateId={app.candidate} 
          jobId={job.id} 
          initialIsShortlisted={shortlistsArray.some(s => s.candidate === app.candidate)}
         />
         <span className="ml-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 capitalize">{app.status}</span>
        </div>
       </div>
       {app.cover_letter && (
        <div className="rounded-lg bg-slate-50 p-4 border text-sm text-slate-700">
         <p className="font-semibold text-slate-900 mb-1">Cover Letter / Note</p>
         <p className="whitespace-pre-wrap">{app.cover_letter}</p>
        </div>
       )}
      </div>
     ))}
    </div>
   )}
   </>
   )}

   <ConfirmModal 
    isOpen={isDeleteModalOpen} 
    onClose={() => setIsDeleteModalOpen(false)} 
    onConfirm={handleDelete}
    title="Delete Job Post"
    message="Are you sure you want to delete this job post? This action cannot be undone."
    confirmText="Delete"
    isDestructive={true}
   />
  </div>
 )
}
