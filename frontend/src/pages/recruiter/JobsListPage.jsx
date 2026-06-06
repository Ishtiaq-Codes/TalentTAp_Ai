import { useFetch } from '@/hooks/useFetch'
import { jobsAPI } from '@/api/jobs'
import EmptyState from '@/components/common/EmptyState'
import SkeletonCard from '@/components/common/SkeletonCard'
import { formatDate } from '@/lib/utils'
import { Link } from 'react-router-dom'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import { Briefcase, Plus, Eye, MapPin, Clock, Users, ArrowRight, Edit2, Trash2, Repeat, Archive } from 'lucide-react'
import ConfirmModal from '@/components/common/ConfirmModal'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/contexts/ToastContext'

const STATUS_COLORS = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-slate-50 text-slate-700 border-slate-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  closed: 'bg-red-50 text-red-700 border-red-200',
  archived: 'bg-slate-100 text-slate-500 border-slate-200',
}

export default function JobsListPage() {
  const { data: jobs, loading, refetch } = useFetch(() => jobsAPI.list())
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  
  const [jobToDelete, setJobToDelete] = useState(null)

  const handleDelete = async () => {
    if (!jobToDelete) return
    try {
      await jobsAPI.delete(jobToDelete)
      success('Job deleted successfully')
      refetch()
    } catch (err) {
      showError('Failed to delete job')
    }
    setJobToDelete(null)
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      if (newStatus === 'repost') {
        await jobsAPI.repost(id)
        success('Job reposted successfully')
      } else {
        await jobsAPI.updateStatus(id, newStatus)
        success(`Job marked as ${newStatus}`)
      }
      refetch()
    } catch (err) {
      showError('Failed to update job status')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  const jobList = Array.isArray(jobs) ? jobs : []

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Postings</h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            Manage your active roles, track applications, and view AI-matched candidates.
          </p>
        </div>
        <Link
          to="/recruiter/jobs/new"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4" /> Post New Job
        </Link>
      </div>

      {jobList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed bg-white p-16 text-center shadow-sm">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Briefcase className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold">No jobs posted yet</h3>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Create your first job posting to start discovering top talent and receiving applications.
          </p>
          <Link
            to="/recruiter/jobs/new"
            className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary/90 transition-all"
          >
            Create Job Post
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {jobList.map((job) => (
            <div key={job.id} className="group relative flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:border-primary/40 hover:-translate-y-1">
              <Link to={`/recruiter/jobs/${job.id}`} className="absolute inset-0 z-0" aria-label={`View ${job.title}`} />

              <div className="relative z-10 pointer-events-none">
                <div className="flex items-start justify-between">
                  <div className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${STATUS_COLORS[job.status] || ''}`}>
                    {job.status}
                  </div>
                  <div className="flex items-center gap-1 pointer-events-auto">
                    {(job.status === 'closed' || job.status === 'archived') ? (
                      <button onClick={(e) => { e.preventDefault(); handleStatusChange(job.id, 'repost') }} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Repost Job">
                        <Repeat className="h-4 w-4" />
                      </button>
                    ) : (
                      <button onClick={(e) => { e.preventDefault(); handleStatusChange(job.id, 'closed') }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Close Job">
                        <Archive className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={(e) => { e.preventDefault(); navigate(`/recruiter/jobs/${job.id}/edit`) }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Job">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={(e) => { e.preventDefault(); setJobToDelete(job.id) }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Job">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex gap-4">
                  <ProfileAvatar src={job.company_logo} name={job.company_name} size="md" className="rounded-xl border border-slate-100 shadow-sm shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">{job.title}</h3>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-600">
                      <span className="flex items-center gap-1.5 capitalize">
                        <Briefcase className="h-3.5 w-3.5 text-slate-400" /> {job.employment_type?.replace('_', ' ')}
                      </span>
                      {(job.city || job.country) && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" /> {job.city || job.country}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" /> {formatDate(job.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-6 pt-5 border-t flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Candidates</span>
                    <span className="text-lg font-bold flex items-center gap-1 mt-0.5">
                      <Users className="h-4 w-4 text-primary" /> {job.applicants_count || 0}
                    </span>
                  </div>
                </div>

                <div className="flex items-center text-sm font-semibold text-primary">
                  View details <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal 
        isOpen={!!jobToDelete} 
        onClose={() => setJobToDelete(null)} 
        onConfirm={handleDelete}
        title="Delete Job Post"
        message="Are you sure you want to delete this job post? All applications and matches associated with it will also be deleted."
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  )
}
