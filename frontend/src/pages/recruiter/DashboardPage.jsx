import { useState } from 'react'
import { useFetch } from '@/hooks/useFetch'
import { jobsAPI } from '@/api/jobs'
import { applicationsAPI } from '@/api/applications'
import { analyticsAPI } from '@/api/analytics'
import { useAuth } from '@/contexts/AuthContext'
import { Briefcase, Users, FileText, TrendingUp, Plus, ArrowRight, Activity, Clock, CheckCircle, ChevronLeft, ChevronRight, Eye, Bookmark, XCircle, Star, RefreshCw, Trash2, Award } from 'lucide-react'
import { Link } from 'react-router-dom'
import SkeletonCard from '@/components/common/SkeletonCard'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import { formatDate, formatDateTime } from '@/lib/utils'

function DashboardStat({ icon: Icon, label, value, trend, trendLabel }) {
 return (
  <div className="glass-card rounded-2xl p-6 transition-all hover:shadow-md">
   <div className="flex items-center justify-between">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
     <Icon className="h-6 w-6"/>
    </div>
    {trend && (
     <span className={`flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${trend.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
      <Activity className="h-3 w-3 mr-1"/> {trend}
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

function StatusBadge({ status }) {
 const styles = {
  applied: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  reviewing: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  shortlisted: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  interview: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  offered: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  rejected: 'bg-red-50 text-red-700 ring-red-600/20',
  withdrawn: 'bg-slate-50 text-slate-700 ring-slate-600/20',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  draft: 'bg-slate-50 text-slate-700 ring-slate-600/20',
  closed: 'bg-red-50 text-red-700 ring-red-600/20',
  paused: 'bg-amber-50 text-amber-700 ring-amber-600/20',
 }
 const style = styles[status] || 'bg-slate-50 text-slate-700 ring-slate-600/20'
 return (
  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset capitalize ${style}`}>
   {status}
  </span>
 )
}

function StatusSelect({ appId, initialStatus, onStatusChange }) {
 const [status, setStatus] = useState(initialStatus)
 const [loading, setLoading] = useState(false)

 const styles = {
  applied: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  reviewing: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  shortlisted: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  interview: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  offered: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  rejected: 'bg-red-50 text-red-700 ring-red-600/20',
  withdrawn: 'bg-slate-50 text-slate-700 ring-slate-600/20',
 }
 
 const style = styles[status] || 'bg-slate-50 text-slate-700 ring-slate-600/20'
 
 const handleChange = async (e) => {
  const newStatus = e.target.value
  setLoading(true)
  try {
   await applicationsAPI.updateStatus(appId, newStatus)
   setStatus(newStatus)
   if (onStatusChange) onStatusChange()
  } catch (error) {
   console.error('Failed to update status', error)
   setStatus(initialStatus)
  } finally {
   setLoading(false)
  }
 }

 return (
  <div className="relative inline-flex items-center">
   <select
    value={status}
    onChange={handleChange}
    disabled={loading}
    className={`appearance-none rounded-md px-3 py-1 pr-8 text-xs font-medium ring-1 ring-inset capitalize cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${style} ${loading ? 'opacity-50' : ''}`}
   >
    <option value="applied">Applied</option>
    <option value="reviewing">Reviewing</option>
    <option value="shortlisted">Shortlisted</option>
    <option value="interview">Interview</option>
    <option value="offered">Offered</option>
    <option value="rejected">Rejected</option>
   </select>
   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
    <svg className={`h-3 w-3 ${styles[status]?.split(' ')[1]}`} fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth="2"d="M19 9l-7 7-7-7"></path></svg>
   </div>
  </div>
 )
}

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function RecruiterDashboard() {
 const { user } = useAuth()
 
 const [jobsPage, setJobsPage] = useState(1)
 const [appsPage, setAppsPage] = useState(1)

 const { data: jobs, meta: jobsMeta, loading: jobsLoading } = useFetch(() => jobsAPI.list({ page: jobsPage, page_size: 5 }), [jobsPage])
 const { data: applications, meta: appsMeta, loading: appsLoading } = useFetch(() => applicationsAPI.list({ page: appsPage, page_size: 5 }), [appsPage])
 const { data: activities, loading: activitiesLoading } = useFetch(() => analyticsAPI.getRecruiterActivities(), [])

 const jobList = Array.isArray(jobs) ? jobs : []
 const appList = Array.isArray(applications) ? applications : []
 
 const totalJobsCount = jobsMeta?.count || jobList.length
 const totalAppsCount = appsMeta?.count || appList.length

 // Compute Pipeline Data
 const pipelineData = [
  { name: 'Applied', count: appList.filter(a => a.status === 'applied').length, color: '#94a3b8' },
  { name: 'Reviewing', count: appList.filter(a => a.status === 'reviewing').length, color: '#3b82f6' },
  { name: 'Shortlisted', count: appList.filter(a => a.status === 'shortlisted').length, color: '#8b5cf6' },
  { name: 'Interview', count: appList.filter(a => a.status === 'interview').length, color: '#4f46e5' },
  { name: 'Offered', count: appList.filter(a => a.status === 'offered').length, color: '#10b981' },
 ]

 if ((jobsLoading && !jobs) || (appsLoading && !applications)) {
  return (
   <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
     {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
   </div>
  )
 }

 return (
  <div className="space-y-8 pb-8 animate-fade-in">
   {/* Header */}
   <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
     <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
     <p className="mt-2 text-sm text-slate-500">Welcome back, {user?.first_name}. Here's what's happening in your hiring pipeline.</p>
    </div>
    <Link to="/recruiter/jobs/new"
     className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-all hover:shadow-primary/20 hover:-translate-y-0.5">
     <Plus className="mr-2 h-4 w-4"/> Post New Job
    </Link>
   </div>

   {/* KPI Cards */}
   <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
    <DashboardStat icon={Briefcase} label="Total Jobs"value={totalJobsCount} trend="+1"trendLabel="this month"/>
    <DashboardStat icon={FileText} label="Total Applications"value={totalAppsCount} trend="+12"trendLabel="new this week"/>
    <DashboardStat icon={Users} label="Candidates to Review"value={pipelineData[0].count} />
    <DashboardStat icon={TrendingUp} label="Interviews Scheduled"value={pipelineData[3].count} />
   </div>

   <div className="grid gap-8 lg:grid-cols-1 xl:grid-cols-3">
    {/* Main Tables Area (Takes up 2/3 width on massive screens) */}
    <div className="xl:col-span-2 space-y-8 min-w-0">
     
     {/* Pipeline Chart */}
     <div className="glass-card rounded-xl overflow-hidden p-6 min-w-0">
      <h2 className="text-base font-semibold text-slate-900 mb-6">Pipeline Health</h2>
      <div className="h-64 w-full">
       <ResponsiveContainer width="100%" height="100%">
        <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
         <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
         <Tooltip 
          cursor={{ fill: '#f1f5f9' }}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
         />
         <Bar dataKey="count" radius={[6, 6, 6, 6]} barSize={40}>
          {pipelineData.map((entry, index) => (
           <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
         </Bar>
        </BarChart>
       </ResponsiveContainer>
      </div>
     </div>
     
     {/* Recent Candidates Table */}
     <div className="glass-card rounded-xl overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
       <h2 className="text-base font-semibold text-slate-900">Recent Candidates</h2>
       <Link to="/recruiter/candidates"className="text-sm font-medium text-primary hover:text-primary/80">View all</Link>
      </div>
      <div className="overflow-x-auto min-h-[400px] w-full pb-2">
       <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-white">
         <tr>
          <th scope="col"className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate</th>
          <th scope="col"className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Applied For</th>
          <th scope="col"className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
          <th scope="col"className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
          <th scope="col"className="relative py-3.5 pl-3 pr-6"><span className="sr-only">Action</span></th>
         </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
         {appList.length === 0 ? (
          <tr><td colSpan="5"className="py-8 text-center text-sm text-slate-500">No candidates found</td></tr>
         ) : appList.map((app) => (
          <tr key={app.id} className="hover:bg-slate-50 transition-colors">
           <td className="whitespace-nowrap py-4 pl-6 pr-3">
            <div className="flex items-center gap-3">
             <ProfileAvatar src={app.candidate_avatar} name={app.candidate_name} size="sm"className="h-9 w-9 rounded-full border border-slate-200"/>
             <div>
              <div className="font-medium text-slate-900">{app.candidate_name}</div>
              <div className="text-xs text-slate-500 w-48 truncate">{app.candidate_headline || 'Candidate'}</div>
             </div>
            </div>
           </td>
           <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600 font-medium">
            {app.job_title}
           </td>
           <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
            {formatDate(app.created_at)}
           </td>
           <td className="whitespace-nowrap px-3 py-4 text-sm">
            <StatusSelect appId={app.id} initialStatus={app.status} />
           </td>
           <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
            <Link to={`/recruiter/candidates/${app.candidate}?job_id=${app.job}`} className="text-primary hover:text-primary/80 inline-flex items-center gap-1">
             <Eye className="h-4 w-4"/> View
            </Link>
           </td>
          </tr>
         ))}
        </tbody>
       </table>
      </div>
      {/* Pagination Controls */}
      {appsMeta && appsMeta.count > 0 && (
       <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3">
        <p className="text-xs text-slate-500">
         Showing <span className="font-medium">{(appsPage - 1) * 5 + 1}</span> to <span className="font-medium">{Math.min(appsPage * 5, appsMeta.count)}</span> of <span className="font-medium">{appsMeta.count}</span>
        </p>
        <div className="flex items-center gap-2">
         <button onClick={() => setAppsPage(p => Math.max(1, p - 1))} disabled={!appsMeta.previous} className="rounded-md border p-1 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="h-4 w-4"/></button>
         <button onClick={() => setAppsPage(p => p + 1)} disabled={!appsMeta.next} className="rounded-md border p-1 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="h-4 w-4"/></button>
        </div>
       </div>
      )}
     </div>

     {/* Job Postings Table */}
     <div className="glass-card rounded-xl overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
       <h2 className="text-base font-semibold text-slate-900">Active Job Postings</h2>
       <Link to="/recruiter/jobs"className="text-sm font-medium text-primary hover:text-primary/80">View all</Link>
      </div>
      <div className="overflow-x-auto min-h-[400px] w-full pb-2">
       <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-white">
         <tr>
          <th scope="col"className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
          <th scope="col"className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
          <th scope="col"className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
          <th scope="col"className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Applicants</th>
          <th scope="col"className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
          <th scope="col"className="relative py-3.5 pl-3 pr-6"><span className="sr-only">Action</span></th>
         </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
         {jobList.length === 0 ? (
          <tr><td colSpan="6"className="py-8 text-center text-sm text-slate-500">No jobs posted yet</td></tr>
         ) : jobList.map((job) => (
          <tr key={job.id} className="hover:bg-slate-50 transition-colors">
           <td className="whitespace-nowrap py-4 pl-6 pr-3 font-medium text-slate-900 text-sm">
            {job.title}
           </td>
           <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
            {job.department || 'General'}
           </td>
           <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
            {job.is_remote === 'remote' ? 'Remote' : (job.city || job.country || 'Not specified')}
           </td>
           <td className="whitespace-nowrap px-3 py-4 text-sm">
            <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
             {job.applicants_count || 0}
            </span>
           </td>
           <td className="whitespace-nowrap px-3 py-4 text-sm">
            <StatusBadge status={job.status} />
           </td>
           <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
            <Link to={`/recruiter/jobs/${job.id}`} className="text-primary hover:text-primary/80 inline-flex items-center gap-1">
             <Eye className="h-4 w-4"/> View
            </Link>
           </td>
          </tr>
         ))}
        </tbody>
       </table>
      </div>
      {/* Pagination Controls */}
      {jobsMeta && jobsMeta.count > 0 && (
       <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3">
        <p className="text-xs text-slate-500">
         Showing <span className="font-medium">{(jobsPage - 1) * 5 + 1}</span> to <span className="font-medium">{Math.min(jobsPage * 5, jobsMeta.count)}</span> of <span className="font-medium">{jobsMeta.count}</span>
        </p>
        <div className="flex items-center gap-2">
         <button onClick={() => setJobsPage(p => Math.max(1, p - 1))} disabled={!jobsMeta.previous} className="rounded-md border p-1 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="h-4 w-4"/></button>
         <button onClick={() => setJobsPage(p => p + 1)} disabled={!jobsMeta.next} className="rounded-md border p-1 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="h-4 w-4"/></button>
        </div>
       </div>
      )}
     </div>

    </div>

    {/* Action Center / Tasks (Takes 1/3 width) */}
    <div className="space-y-6">
     <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-5 border-b border-slate-200 bg-slate-50/50">
       <h3 className="font-semibold text-slate-900 text-sm">Tasks & Notifications</h3>
      </div>
      <div className="divide-y divide-slate-100 p-2">
       <Link to="/recruiter/jobs"className="flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors rounded-lg">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
         <Clock className="h-4 w-4"/>
        </div>
        <div>
         <p className="text-sm font-medium text-slate-900">Review new applications</p>
         <p className="text-xs text-slate-500 mt-0.5">Candidates are waiting in the"Applied"stage.</p>
        </div>
       </Link>
       <Link to="/recruiter/candidates"className="flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors rounded-lg">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
         <TrendingUp className="h-4 w-4"/>
        </div>
        <div>
         <p className="text-sm font-medium text-slate-900">Source new talent</p>
         <p className="text-xs text-slate-500 mt-0.5">Your AI model is ready. Discover passive candidates.</p>
        </div>
       </Link>
       {user?.role === 'company_admin' && (
        <Link to="/company/team"className="flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors rounded-lg">
         <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle className="h-4 w-4"/>
         </div>
         <div>
          <p className="text-sm font-medium text-slate-900">Invite team members</p>
          <p className="text-xs text-slate-500 mt-0.5">Collaborate on hiring by adding recruiters.</p>
         </div>
        </Link>
       )}
      </div>
     </div>

     {/* Recent Activity Feed */}
     <div className="glass-card rounded-xl overflow-hidden flex flex-col max-h-[500px]">
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
       <h3 className="font-semibold text-slate-900 text-sm">Recent Activity</h3>
       <Activity className="h-4 w-4 text-slate-400"/>
      </div>
      <div className="p-2 overflow-y-auto overflow-x-hidden flex-1">
       {activitiesLoading ? (
        <div className="p-4 flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div></div>
       ) : (!activities || activities.length === 0) ? (
        <div className="py-8 text-center px-4">
         <Activity className="h-8 w-8 text-slate-300 mx-auto mb-3"/>
         <p className="text-sm text-slate-500">Your recent actions will appear here.</p>
        </div>
       ) : (
        <div className="space-y-1">
         {activities.map((activity) => {
          let Icon = Eye;
          let iconClass ="bg-blue-100 text-blue-600";
          
          let titleText ="";
          let subtitleText ="";
          let linkTo ="#";

          if (activity.action_type === 'view') {
           titleText = <span>You <span className="font-medium">viewed</span> {activity.candidate_name}'s profile</span>;
           subtitleText = activity.job_title ? `For ${activity.job_title}` : activity.candidate_headline;
           linkTo = `/recruiter/candidates/${activity.candidate_id}${activity.job_title ? '?job_id=' : ''}`;
          } else if (activity.action_type === 'shortlist') {
           Icon = Star;
           iconClass ="bg-purple-100 text-purple-600";
           titleText = <span>You <span className="font-medium">shortlisted</span> {activity.candidate_name}</span>;
           subtitleText = activity.job_title ? `For ${activity.job_title}` : activity.candidate_headline;
           linkTo = `/recruiter/candidates/${activity.candidate_id}${activity.job_title ? '?job_id=' : ''}`;
          } else if (activity.action_type === 'reject') {
           Icon = XCircle;
           iconClass ="bg-red-100 text-red-600";
           titleText = <span>You <span className="font-medium">rejected</span> {activity.candidate_name}</span>;
           subtitleText = activity.job_title ? `For ${activity.job_title}` : activity.candidate_headline;
           linkTo = `/recruiter/candidates/${activity.candidate_id}${activity.job_title ? '?job_id=' : ''}`;
          } else if (activity.action_type === 'save') {
           Icon = Bookmark;
           iconClass ="bg-emerald-100 text-emerald-600";
           titleText = <span>You <span className="font-medium">saved</span> {activity.candidate_name}</span>;
           subtitleText = activity.job_title ? `For ${activity.job_title}` : activity.candidate_headline;
           linkTo = `/recruiter/candidates/${activity.candidate_id}${activity.job_title ? '?job_id=' : ''}`;
          } else if (activity.action_type === 'status_change') {
            let detailsObj = {};
            try { detailsObj = typeof activity.details === 'string' ? JSON.parse(activity.details) : (activity.details || {}); } catch(e) {}
            const status = (detailsObj.status ||"a new stage").toLowerCase();
            
            if (status === 'rejected') {
             Icon = XCircle;
             iconClass ="bg-red-100 text-red-600";
             titleText = <span>You <span className="font-medium">rejected</span> {activity.candidate_name}</span>;
            } else if (status === 'offered') {
             Icon = Award;
             iconClass ="bg-emerald-100 text-emerald-600";
             titleText = <span>You <span className="font-medium">offered</span> a job to {activity.candidate_name}</span>;
            } else if (status === 'interview') {
             Icon = Clock;
             iconClass ="bg-indigo-100 text-indigo-600";
             titleText = <span>You scheduled an <span className="font-medium">interview</span> with {activity.candidate_name}</span>;
            } else if (status === 'shortlisted') {
             Icon = Star;
             iconClass ="bg-purple-100 text-purple-600";
             titleText = <span>You <span className="font-medium">shortlisted</span> {activity.candidate_name}</span>;
            } else {
             Icon = RefreshCw;
             iconClass ="bg-indigo-100 text-indigo-600";
             titleText = <span>Moved {activity.candidate_name} to <span className="font-medium capitalize">{status}</span></span>;
            }
            subtitleText = activity.job_title ? `For ${activity.job_title}` : activity.candidate_headline;
            linkTo = `/recruiter/candidates/${activity.candidate_id}${activity.job_title ? '?job_id=' : ''}`;
          } else if (activity.action_type === 'job_create') {
           Icon = Briefcase;
           iconClass ="bg-blue-100 text-blue-600";
           titleText = <span>You <span className="font-medium">posted</span> a new job</span>;
           subtitleText = activity.details?.title ||"Job Posting";
           linkTo = `/recruiter/jobs/${activity.job_title ? activity.job_id : ''}`;
          } else if (activity.action_type === 'job_delete') {
           Icon = Trash2;
           iconClass ="bg-slate-100 text-slate-600";
           titleText = <span>You <span className="font-medium">deleted</span> a job post</span>;
           subtitleText = activity.details?.title ||"Job Posting";
           linkTo = `/recruiter/jobs`;
          } else if (activity.action_type === 'talent_pool') {
           Icon = Users;
           iconClass ="bg-amber-100 text-amber-600";
           const poolName = activity.details?.pool_name ||"a talent pool";
           titleText = <span>Added {activity.candidate_name} to <span className="font-medium">{poolName}</span></span>;
           subtitleText ="Talent Pool Activity";
           linkTo = `/company/talent-pools`;
          }

          return (
           <Link 
            key={activity.id} 
            to={linkTo} 
            className="flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors rounded-lg group"
           >
            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconClass}`}>
             <Icon className="h-4 w-4"/>
            </div>
            <div className="flex-1 min-w-0">
             <p className="text-sm text-slate-900 truncate">
              {titleText}
             </p>
             <p className="text-xs text-slate-500 mt-0.5 flex items-center justify-between gap-2">
              <span className="truncate flex-1">{subtitleText}</span>
              <span className="shrink-0 whitespace-nowrap text-slate-400">{formatDateTime(activity.timestamp)}</span>
             </p>
            </div>
           </Link>
          )
         })}
        </div>
       )}
      </div>
     </div>
    </div>
   </div>
  </div>
 )
}
