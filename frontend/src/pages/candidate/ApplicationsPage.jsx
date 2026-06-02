import { useFetch } from '@/hooks/useFetch'
import { applicationsAPI } from '@/api/applications'
import EmptyState from '@/components/common/EmptyState'
import SkeletonCard from '@/components/common/SkeletonCard'
import { formatDate } from '@/lib/utils'
import { FileText, ExternalLink } from 'lucide-react'

const STATUS_COLORS = {
  applied: 'bg-blue-100 text-blue-700',
  reviewing: 'bg-purple-100 text-purple-700',
  shortlisted: 'bg-amber-100 text-amber-700',
  interview: 'bg-cyan-100 text-cyan-700',
  offered: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-700',
}

export default function ApplicationsPage() {
  const { data: applications, loading } = useFetch(() => applicationsAPI.list())

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>

  const appList = Array.isArray(applications) ? applications : []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Applications</h1>

      {appList.length === 0 ? (
        <EmptyState icon={FileText} title="No applications yet" description="Start browsing jobs and apply to positions that match your skills." />
      ) : (
        <div className="space-y-3">
          {appList.map((app) => (
            <div key={app.id} className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{app.job_title || 'Job'}</h3>
                  <p className="text-sm text-muted-foreground">{app.company_name}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_COLORS[app.status] || 'bg-gray-100'}`}>
                  {app.status?.replace('_', ' ')}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span>Applied {formatDate(app.created_at)}</span>
                {app.cover_letter && <span>• Cover letter included</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
