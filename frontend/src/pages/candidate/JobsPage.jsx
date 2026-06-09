import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFetch } from '@/hooks/useFetch'
import { useDebounce } from '@/hooks/useDebounce'
import { jobsAPI } from '@/api/jobs'
import { applicationsAPI } from '@/api/applications'
import EmptyState from '@/components/common/EmptyState'
import SkeletonCard from '@/components/common/SkeletonCard'
import { EMPLOYMENT_TYPE, REMOTE_STATUS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import { Search, MapPin, Briefcase, DollarSign, Clock } from 'lucide-react'

export default function JobsPage() {
 const [search, setSearch] = useState('')
 const [filters, setFilters] = useState({})
 const debounced = useDebounce(search)
 const { data: jobs, loading, refetch } = useFetch(
  () => jobsAPI.list({ search: debounced, status: 'active', ...filters }),
  [debounced, filters],
 )
 const [applying, setApplying] = useState(null)
 const [applied, setApplied] = useState(new Set())

 const handleApply = async (e, jobId) => {
  e.preventDefault()
  e.stopPropagation()
  setApplying(jobId)
  try {
   await applicationsAPI.apply({ job: jobId })
   setApplied((prev) => new Set([...prev, jobId]))
  } catch { /* already applied */ }
  setApplying(null)
 }

 const jobList = Array.isArray(jobs) ? jobs : []

 return (
  <div className="space-y-6">
   <div>
    <h1 className="text-2xl font-bold">Browse Jobs</h1>
    <p className="text-muted-foreground">Find opportunities that match your skills.</p>
   </div>

   {/* Search & filters */}
   <div className="flex flex-col gap-3 sm:flex-row">
    <div className="relative flex-1">
     <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
     <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs, skills, companies..."
      className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"/>
    </div>
    <select onChange={(e) => setFilters({ ...filters, employment_type: e.target.value || undefined })}
     className="rounded-lg border bg-background px-4 py-2.5 text-sm">
     <option value="">All Types</option>
     {EMPLOYMENT_TYPE.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
    </select>
    <select onChange={(e) => setFilters({ ...filters, is_remote: e.target.value || undefined })}
     className="rounded-lg border bg-background px-4 py-2.5 text-sm">
     <option value="">All Locations</option>
     {REMOTE_STATUS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
    </select>
   </div>

   {/* Results */}
   {loading ? (
    <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
   ) : jobList.length === 0 ? (
    <EmptyState icon={Briefcase} title="No jobs found"description="Try adjusting your search or filters."/>
   ) : (
    <div className="space-y-4">
     {jobList.map((job) => (
      <div key={job.id} className="group relative rounded-xl border bg-card p-6 transition-shadow hover:shadow-md hover:border-primary/30">
       <Link to={`/candidate/jobs/${job.id}`} className="absolute inset-0 z-0"aria-label={`View ${job.title}`} />
       <div className="flex items-start justify-between pointer-events-none">
        <div className="flex gap-4">
         <Link to={`/companies/${job.company}`} className="shrink-0 z-20 relative pointer-events-auto">
          <ProfileAvatar src={job.company_logo} name={job.company_name} size="lg"className="rounded-xl border border-slate-100 shadow-sm hover:border-primary/50 transition-colors"/>
         </Link>
         <div>
          <Link to={`/candidate/jobs/${job.id}`} className="z-20 relative pointer-events-auto group-hover:text-primary transition-colors">
           <h3 className="text-lg font-semibold">{job.title}</h3>
          </Link>
          <Link to={`/companies/${job.company}`} className="mt-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors z-20 relative inline-block pointer-events-auto">
           {job.company_name}
          </Link>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
           <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5"/> {job.city || job.country || 'Remote'}</span>
           <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5"/> {job.employment_type?.replace('_', ' ')}</span>
           <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5"/> {job.is_remote}</span>
           {job.salary_min && <span className="inline-flex items-center gap-1"><DollarSign className="h-3.5 w-3.5"/> {job.salary_min}-{job.salary_max} {job.salary_currency}</span>}
          </div>
          {job.skills?.length > 0 && (
           <div className="mt-3 flex flex-wrap gap-1.5">
            {job.skills.map((s) => (
             <span key={s.id} className={`rounded-md px-2.5 py-1 text-xs font-medium border ${s.is_required ? 'bg-primary/5 text-primary border-primary/20' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
              {s.name}
             </span>
            ))}
           </div>
          )}
         </div>
        </div>
        <div className="flex flex-col items-end gap-3 shrink-0 z-20 relative pointer-events-auto">
         <button
          onClick={(e) => handleApply(e, job.id)}
          disabled={applying === job.id || applied.has(job.id) || job.has_applied}
          className="w-full sm:w-auto rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-all"
         >
          {applied.has(job.id) || job.has_applied ? '✓ Applied' : applying === job.id ? 'Applying...' : 'Apply Now'}
         </button>
         <p className="text-xs text-slate-500 font-medium">Posted {formatDate(job.created_at)}</p>
        </div>
       </div>
      </div>
     ))}
    </div>
   )}
  </div>
 )
}
