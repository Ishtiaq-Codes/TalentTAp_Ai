import { useFetch } from '@/hooks/useFetch'
import { jobsAPI } from '@/api/jobs'
import { applicationsAPI } from '@/api/applications'
import { useAuth } from '@/contexts/AuthContext'
import StatCard from '@/components/common/StatCard'
import SkeletonCard from '@/components/common/SkeletonCard'
import { Briefcase, Users, FileText, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const { data: jobs, loading } = useFetch(() => jobsAPI.list())
  const { data: applications } = useFetch(() => applicationsAPI.list())

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  const jobList = Array.isArray(jobs) ? jobs : []
  const appList = Array.isArray(applications) ? applications : []
  const activeJobs = jobList.filter(j => j.status === 'active').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
          <p className="text-muted-foreground">Manage your jobs and find the best candidates.</p>
        </div>
        <Link to="/recruiter/jobs/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          + Post Job
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Briefcase} label="Total Jobs" value={jobList.length} />
        <StatCard icon={TrendingUp} label="Active Jobs" value={activeJobs} />
        <StatCard icon={FileText} label="Applications" value={appList.length} />
        <StatCard icon={Users} label="Candidates" value="-" />
      </div>

      {/* Recent jobs */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold">Your Jobs</h2>
          <Link to="/recruiter/jobs" className="text-sm text-primary hover:underline">View All</Link>
        </div>
        <div className="divide-y">
          {jobList.length > 0 ? jobList.slice(0, 5).map((job) => (
            <Link key={job.id} to={`/recruiter/jobs/${job.id}`} className="flex items-center justify-between p-4 hover:bg-muted/50">
              <div>
                <p className="font-medium">{job.title}</p>
                <p className="text-sm text-muted-foreground">{job.employment_type} · {job.is_remote} · {job.city || job.country}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                job.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                job.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {job.status}
              </span>
            </Link>
          )) : (
            <div className="p-8 text-center text-sm text-muted-foreground">No jobs yet. Post your first job!</div>
          )}
        </div>
      </div>
    </div>
  )
}
