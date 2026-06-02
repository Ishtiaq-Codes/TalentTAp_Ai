import { useFetch } from '@/hooks/useFetch'
import { jobsAPI } from '@/api/jobs'
import EmptyState from '@/components/common/EmptyState'
import SkeletonCard from '@/components/common/SkeletonCard'
import { formatDate } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { Briefcase, Plus, Eye, Edit, Users } from 'lucide-react'

const STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-gray-100 text-gray-700',
  paused: 'bg-amber-100 text-amber-700',
  closed: 'bg-red-100 text-red-700',
  archived: 'bg-gray-100 text-gray-500',
}

export default function JobsListPage() {
  const { data: jobs, loading } = useFetch(() => jobsAPI.list())

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>

  const jobList = Array.isArray(jobs) ? jobs : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Jobs</h1>
          <p className="text-muted-foreground">Manage and track your job postings.</p>
        </div>
        <Link to="/recruiter/jobs/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Post Job
        </Link>
      </div>

      {jobList.length === 0 ? (
        <EmptyState icon={Briefcase} title="No jobs posted" description="Create your first job posting to start finding candidates."
          action={<Link to="/recruiter/jobs/new" className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Post Your First Job</Link>} />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Job</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase hidden lg:table-cell">Posted</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {jobList.map((job) => (
                <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm">{job.title}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell capitalize">{job.employment_type?.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{job.city || job.country || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[job.status] || ''}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">{formatDate(job.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link to={`/recruiter/jobs/${job.id}`} className="rounded p-1.5 hover:bg-muted" title="View"><Eye className="h-4 w-4" /></Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
