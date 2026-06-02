import { useState } from 'react'
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

  const handleApply = async (jobId) => {
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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs, skills, companies..."
            className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none" />
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
        <EmptyState icon={Briefcase} title="No jobs found" description="Try adjusting your search or filters." />
      ) : (
        <div className="space-y-4">
          {jobList.map((job) => (
            <div key={job.id} className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <ProfileAvatar src={job.company_logo} name={job.company_name} size="lg" className="rounded-xl border border-slate-100 shadow-sm" />
                  <div>
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    <p className="mt-1 text-sm font-medium text-primary">{job.company_name}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.city || job.country || 'Remote'}</span>
                    <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.employment_type?.replace('_', ' ')}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {job.is_remote}</span>
                    {job.salary_min && <span className="inline-flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> {job.salary_min}-{job.salary_max} {job.salary_currency}</span>}
                  </div>
                  {job.skills?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {job.skills.map((s) => (
                        <span key={s.id} className={`rounded-full px-2.5 py-0.5 text-xs ${s.is_required ? 'bg-primary/10 text-primary font-medium' : 'bg-muted text-muted-foreground'}`}>
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleApply(job.id)}
                  disabled={applying === job.id || applied.has(job.id)}
                  className="ml-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 shrink-0"
                >
                  {applied.has(job.id) ? '✓ Applied' : applying === job.id ? 'Applying...' : 'Apply'}
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Posted {formatDate(job.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
