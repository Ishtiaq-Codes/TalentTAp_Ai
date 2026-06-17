import { useState } from 'react'
import { useFetch } from '@/hooks/useFetch'
import { jobsAPI } from '@/api/jobs'
import { applicationsAPI } from '@/api/applications'
import { analyticsAPI } from '@/api/analytics'
import { useAuth } from '@/contexts/AuthContext'
import { Briefcase, Users, FileText, TrendingUp, Plus, Activity, Clock, CheckCircle, ChevronLeft, ChevronRight, Eye, Bookmark, XCircle, Star, RefreshCw, Trash2, Award } from 'lucide-react'
import { Link } from 'react-router-dom'
import SkeletonCard from '@/components/common/SkeletonCard'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import { formatDate, formatDateTime } from '@/lib/utils'
import DashboardStat from '@/components/dashboard/DashboardStat'
import StatusBadge from '@/components/common/StatusBadge'
import StatusSelect from '@/components/common/StatusSelect'



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
   {/* ── Header ── */}
   <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
     <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
     <p className="mt-1 text-sm text-slate-500">Welcome back, <span className="font-semibold text-slate-700">{user?.first_name}</span>. Here's your hiring pipeline.</p>
    </div>
    <Link to="/recruiter/jobs/new" className="btn btn-primary">
     <Plus className="h-4 w-4"/> Post New Job
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
     <div className="card-premium p-6 min-w-0">
      <div className="flex items-center gap-2 mb-5">
       <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-500">
        <TrendingUp className="h-4 w-4"/>
       </div>
       <h2 className="text-base font-bold text-slate-900">Pipeline Health</h2>
      </div>
      <div className="h-60 w-full">
       <ResponsiveContainer width="100%" height="100%">
        <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
         <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
         <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px -4px rgba(0,0,0,0.1)' }} />
         <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={36}>
          {pipelineData.map((entry, index) => (
           <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
         </Bar>
        </BarChart>
       </ResponsiveContainer>
      </div>
     </div>
     
     {/* Recent Candidates Table */}
     <div className="card-premium overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4 flex items-center justify-between">
       <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-500"><Users className="h-4 w-4"/></div>
        <h2 className="text-sm font-bold text-slate-900">Recent Candidates</h2>
       </div>
       <Link to="/recruiter/candidates" className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors">View all</Link>
      </div>
      <div className="overflow-x-auto min-h-[400px] w-full pb-2">
       <table className="min-w-full divide-y divide-slate-200">
        <thead className="border-b border-slate-100 bg-slate-50/60">
         <tr>
          <th scope="col" className="py-3 pl-6 pr-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Candidate</th>
          <th scope="col" className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Applied For</th>
          <th scope="col" className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
          <th scope="col" className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
          <th scope="col" className="relative py-3 pl-3 pr-6"><span className="sr-only">Action</span></th>
         </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
         {appList.length === 0 ? (
          <tr><td colSpan="5" className="py-8 text-center text-sm text-slate-400">No candidates found</td></tr>
         ) : appList.map((app) => (
          <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
           <td className="whitespace-nowrap py-4 pl-6 pr-3">
            <div className="flex items-center gap-3">
             <ProfileAvatar src={app.candidate_avatar} name={app.candidate_name} size="sm" className="h-9 w-9 rounded-full border border-slate-200"/>
             <div>
              <div className="font-semibold text-slate-900 text-sm group-hover:text-violet-700 transition-colors">{app.candidate_name}</div>
              <div className="text-xs text-slate-400 w-48 truncate">{app.candidate_headline || 'Candidate'}</div>
             </div>
            </div>
           </td>
           <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600 font-medium">{app.job_title}</td>
           <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-400">{formatDate(app.created_at)}</td>
           <td className="whitespace-nowrap px-3 py-4 text-sm"><StatusSelect appId={app.id} initialStatus={app.status} /></td>
           <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm">
            <Link to={`/recruiter/candidates/${app.candidate}?job_id=${app.job}`} className="text-violet-600 hover:text-violet-700 inline-flex items-center gap-1 font-semibold text-xs">
             <Eye className="h-3.5 w-3.5"/> View
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
     <div className="card-premium overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4 flex items-center justify-between">
       <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-500"><Briefcase className="h-4 w-4"/></div>
        <h2 className="text-sm font-bold text-slate-900">Active Job Postings</h2>
       </div>
       <Link to="/recruiter/jobs" className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors">View all</Link>
      </div>
      <div className="overflow-x-auto min-h-[400px] w-full pb-2">
       <table className="min-w-full divide-y divide-slate-200">
        <thead className="border-b border-slate-100 bg-slate-50/60">
         <tr>
          <th scope="col" className="py-3 pl-6 pr-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Role</th>
          <th scope="col" className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Department</th>
          <th scope="col" className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Location</th>
          <th scope="col" className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Applicants</th>
          <th scope="col" className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
          <th scope="col" className="relative py-3 pl-3 pr-6"><span className="sr-only">Action</span></th>
         </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
         {jobList.length === 0 ? (
          <tr><td colSpan="6" className="py-8 text-center text-sm text-slate-400">No jobs posted yet</td></tr>
         ) : jobList.map((job) => (
          <tr key={job.id} className="hover:bg-slate-50 transition-colors group">
           <td className="whitespace-nowrap py-4 pl-6 pr-3 font-semibold text-slate-900 text-sm group-hover:text-violet-700 transition-colors">{job.title}</td>
           <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{job.department || 'General'}</td>
           <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{job.is_remote === 'remote' ? 'Remote' : (job.city || job.country || 'Not specified')}</td>
           <td className="whitespace-nowrap px-3 py-4 text-sm">
            <span className="inline-flex items-center justify-center rounded-full bg-violet-50 border border-violet-200 px-2.5 py-0.5 text-xs font-bold text-violet-700">{job.applicants_count || 0}</span>
           </td>
           <td className="whitespace-nowrap px-3 py-4 text-sm"><StatusBadge status={job.status} /></td>
           <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm">
            <Link to={`/recruiter/jobs/${job.id}`} className="text-violet-600 hover:text-violet-700 inline-flex items-center gap-1 font-semibold text-xs">
             <Eye className="h-3.5 w-3.5"/> View
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

    {/* Action Center */}
    <div className="space-y-5">
     <div className="card-premium overflow-hidden">
      <div className="p-5 border-b border-slate-100">
       <h3 className="font-bold text-slate-900 text-sm">Quick Actions</h3>
      </div>
      <div className="divide-y divide-slate-50 p-2">
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
     <div className="card-premium overflow-hidden flex flex-col max-h-[500px]">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
       <h3 className="font-bold text-slate-900 text-sm">Recent Activity</h3>
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
