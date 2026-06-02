import { useFetch } from '@/hooks/useFetch'
import { jobsAPI } from '@/api/jobs'
import { applicationsAPI } from '@/api/applications'
import { useAuth } from '@/contexts/AuthContext'
import { Briefcase, Users, FileText, TrendingUp, Plus, ArrowRight, Activity, Clock, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import SkeletonCard from '@/components/common/SkeletonCard'

function DashboardStat({ icon: Icon, label, value, trend, trendLabel }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <span className={`flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${trend.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
            <Activity className="h-3 w-3 mr-1" /> {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
        <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{value}</p>
        {trendLabel && <p className="mt-1 text-xs text-muted-foreground">{trendLabel}</p>}
      </div>
    </div>
  )
}

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const { data: jobs, loading } = useFetch(() => jobsAPI.list())
  const { data: applications } = useFetch(() => applicationsAPI.list())

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  const jobList = Array.isArray(jobs) ? jobs : []
  const appList = Array.isArray(applications) ? applications : []
  const activeJobs = jobList.filter(j => j.status === 'active').length
  const newApps = appList.filter(a => a.status === 'applied').length

  return (
    <div className="space-y-8 pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="mt-2 text-muted-foreground">Here's what's happening in your hiring pipeline today.</p>
        </div>
        <Link to="/recruiter/jobs/new"
          className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/25 hover:bg-primary/90 transition-all">
          <Plus className="mr-2 h-4 w-4" /> Post New Job
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStat icon={Briefcase} label="Total Jobs Posted" value={jobList.length} trend="+1" trendLabel="from last month" />
        <DashboardStat icon={TrendingUp} label="Active Listings" value={activeJobs} />
        <DashboardStat icon={FileText} label="Total Applications" value={appList.length} trend="+12" trendLabel="new this week" />
        <DashboardStat icon={Users} label="Candidates to Review" value={newApps} />
      </div>

      {/* Main Content Split */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Active Jobs Pipeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Active Jobs Pipeline</h2>
            <Link to="/recruiter/jobs" className="text-sm font-semibold text-primary hover:underline">View all jobs</Link>
          </div>
          
          <div className="grid gap-4">
            {jobList.length > 0 ? jobList.filter(j => j.status === 'active').slice(0, 4).map((job) => (
              <Link key={job.id} to={`/recruiter/jobs/${job.id}`} className="group rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{job.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span className="font-medium text-slate-700">{job.employment_type?.replace('_', ' ')}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>{job.is_remote}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>{job.city || job.country}</span>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground">Applications</p>
                      <p className="font-semibold">{appList.filter(a => a.job === job.id).length || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">AI Matches</p>
                      <p className="font-semibold text-primary">New</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    Active
                  </span>
                </div>
              </Link>
            )) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center bg-slate-50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200/50 mb-4">
                  <Briefcase className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold">No active jobs</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                  Post a job to start receiving AI-matched candidate recommendations instantly.
                </p>
                <Link to="/recruiter/jobs/new" className="mt-6 rounded-full bg-white px-6 py-2 text-sm font-semibold border shadow-sm hover:bg-slate-50 transition-colors">
                  Post a Job
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Action Center / Tasks */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight">Action Center</h2>
          
          <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b bg-slate-50/50">
              <h3 className="font-semibold text-sm">Tasks & Notifications</h3>
            </div>
            <div className="divide-y p-2">
              
              {newApps > 0 && (
                <Link to="/recruiter/jobs" className="flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors rounded-lg">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Review new applications</p>
                    <p className="text-xs text-muted-foreground mt-0.5">You have {newApps} candidates waiting in the "Applied" stage.</p>
                  </div>
                </Link>
              )}

              <Link to="/recruiter/candidates" className="flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors rounded-lg">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Source new talent</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Your AI model is ready. Discover passive candidates.</p>
                </div>
              </Link>

              {user?.role === 'company_admin' && (
                <Link to="/company/team" className="flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors rounded-lg">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Invite team members</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Collaborate on hiring by adding recruiters.</p>
                  </div>
                </Link>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
