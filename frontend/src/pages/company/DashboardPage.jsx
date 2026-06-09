import { useState } from 'react'
import { useFetch } from '@/hooks/useFetch'
import { companiesAPI } from '@/api/companies'
import { Link } from 'react-router-dom'
import {
 Users, Briefcase, FileText, Heart, MessageSquare, Sparkles,
 TrendingUp, CheckCircle2, ChevronRight, Building2,
 Trophy, Eye, Star, XCircle, Bookmark, RefreshCw, Trash2, Activity, Clock, Award
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import SkeletonCard from '@/components/common/SkeletonCard'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

/* ─── Stat Card ─── */
function DashStat({ icon: Icon, label, value, color = 'blue', sub }) {
 const colors = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  violet: 'bg-violet-50 text-violet-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  slate: 'bg-slate-100 text-slate-500',
 }
 return (
  <div className="glass-card rounded-2xl p-5">
   <div className="flex items-start justify-between">
    <div>
     <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
     <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value ?? '—'}</p>
     {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}>
     <Icon className="h-5 w-5"/>
    </div>
   </div>
  </div>
 )
}

/* ─── Pipeline Bar ─── */
function PipelineBar({ label, count, total, color }) {
 const pct = total > 0 ? Math.round((count / total) * 100) : 0
 return (
  <div className="space-y-1.5">
   <div className="flex items-center justify-between text-sm">
    <span className="font-medium text-slate-700 capitalize">{label}</span>
    <span className="font-semibold text-slate-900">{count}</span>
   </div>
   <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
    <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
   </div>
  </div>
 )
}

/* ─── Recruiter Row ─── */
function RecruiterRow({ recruiter }) {
 return (
  <div className="flex items-center gap-4 py-3 border-b last:border-0">
   <ProfileAvatar name={recruiter.name} src={recruiter.avatar} size="md"/>
   <div className="flex-1 min-w-0">
    <p className="font-semibold text-slate-900 truncate">{recruiter.name}</p>
    <p className="text-xs text-slate-400 truncate">{recruiter.title}</p>
   </div>
   <div className="hidden sm:flex items-center gap-6 shrink-0 text-center">
    <div>
     <p className="text-sm font-bold text-slate-900">{recruiter.jobs_count}</p>
     <p className="text-[10px] text-slate-400 uppercase tracking-wide">Jobs</p>
    </div>
    <div>
     <p className="text-sm font-bold text-slate-900">{recruiter.shortlists_count}</p>
     <p className="text-[10px] text-slate-400 uppercase tracking-wide">Saved</p>
    </div>
    <div>
     <p className="text-sm font-bold text-slate-900">{recruiter.messages_count}</p>
     <p className="text-[10px] text-slate-400 uppercase tracking-wide">Msgs</p>
    </div>
   </div>
   <div className="shrink-0">
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
     recruiter.is_active
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
      : 'bg-slate-100 text-slate-500 border border-slate-200'
    }`}>
     {recruiter.is_active ? <CheckCircle2 className="h-3 w-3"/> : null}
     {recruiter.is_active ? 'Active' : 'Suspended'}
    </span>
   </div>
  </div>
 )
}

/* 🔹🔹🔹 Recruiter Activity Card 🔹🔹🔹 */
function RecruiterActivityCard({ recruiter }) {
 const activities = recruiter.recent_activities || [];
 const rName = recruiter.name.split(' ')[0];

 return (
  <div className="glass-card rounded-xl overflow-hidden flex flex-col h-[400px]">
   <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-3">
    <ProfileAvatar name={recruiter.name} src={recruiter.avatar} size="sm"/>
    <div>
     <h3 className="font-semibold text-slate-900 text-sm leading-tight">{recruiter.name}</h3>
     <p className="text-xs text-slate-500">Recent Activity</p>
    </div>
   </div>
   <div className="p-2 overflow-y-auto overflow-x-hidden flex-1">
    {activities.length === 0 ? (
     <div className="py-8 text-center px-4">
      <Activity className="h-8 w-8 text-slate-300 mx-auto mb-3"/>
      <p className="text-sm text-slate-500">No recent actions.</p>
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
        titleText = <span><span className="font-medium">{rName}</span> viewed {activity.candidate_name}'s profile</span>;
        subtitleText = activity.job_title ? `For ${activity.job_title}` : activity.candidate_headline;
        linkTo = `/recruiter/candidates/${activity.candidate_id}${activity.job_title ? '?job_id=' : ''}`;
       } else if (activity.action_type === 'shortlist') {
        Icon = Star;
        iconClass ="bg-purple-100 text-purple-600";
        titleText = <span><span className="font-medium">{rName}</span> shortlisted {activity.candidate_name}</span>;
        subtitleText = activity.job_title ? `For ${activity.job_title}` : activity.candidate_headline;
        linkTo = `/recruiter/candidates/${activity.candidate_id}${activity.job_title ? '?job_id=' : ''}`;
       } else if (activity.action_type === 'reject') {
        Icon = XCircle;
        iconClass ="bg-red-100 text-red-600";
        titleText = <span><span className="font-medium">{rName}</span> rejected {activity.candidate_name}</span>;
        subtitleText = activity.job_title ? `For ${activity.job_title}` : activity.candidate_headline;
        linkTo = `/recruiter/candidates/${activity.candidate_id}${activity.job_title ? '?job_id=' : ''}`;
       } else if (activity.action_type === 'save') {
        Icon = Bookmark;
        iconClass ="bg-emerald-100 text-emerald-600";
        titleText = <span><span className="font-medium">{rName}</span> saved {activity.candidate_name}</span>;
        subtitleText = activity.job_title ? `For ${activity.job_title}` : activity.candidate_headline;
        linkTo = `/recruiter/candidates/${activity.candidate_id}${activity.job_title ? '?job_id=' : ''}`;
       } else if (activity.action_type === 'status_change') {
        let detailsObj = {};
        try { detailsObj = typeof activity.details === 'string' ? JSON.parse(activity.details) : (activity.details || {}); } catch(e) {}
        const status = (detailsObj.status ||"a new stage").toLowerCase();
        
        if (status === 'rejected') {
         Icon = XCircle;
         iconClass ="bg-red-100 text-red-600";
         titleText = <span><span className="font-medium">{rName}</span> rejected {activity.candidate_name}</span>;
        } else if (status === 'offered') {
         Icon = Award;
         iconClass ="bg-emerald-100 text-emerald-600";
         titleText = <span><span className="font-medium">{rName}</span> offered a job to {activity.candidate_name}</span>;
        } else if (status === 'interview') {
         Icon = Clock;
         iconClass ="bg-indigo-100 text-indigo-600";
         titleText = <span><span className="font-medium">{rName}</span> scheduled an interview with {activity.candidate_name}</span>;
        } else if (status === 'shortlisted') {
         Icon = Star;
         iconClass ="bg-purple-100 text-purple-600";
         titleText = <span><span className="font-medium">{rName}</span> shortlisted {activity.candidate_name}</span>;
        } else {
         Icon = RefreshCw;
         iconClass ="bg-indigo-100 text-indigo-600";
         titleText = <span>{rName} moved {activity.candidate_name} to <span className="font-medium capitalize">{status}</span></span>;
        }
        subtitleText = activity.job_title ? `For ${activity.job_title}` : activity.candidate_headline;
        linkTo = `/recruiter/candidates/${activity.candidate_id}${activity.job_title ? '?job_id=' : ''}`;
       } else if (activity.action_type === 'job_create') {
        Icon = Briefcase;
        iconClass ="bg-blue-100 text-blue-600";
        titleText = <span><span className="font-medium">{rName}</span> posted a new job</span>;
        subtitleText = activity.details?.title ||"Job Posting";
        linkTo = `/recruiter/jobs/${activity.job_title ? activity.job_id : ''}`;
       } else if (activity.action_type === 'job_delete') {
        Icon = Trash2;
        iconClass ="bg-slate-100 text-slate-600";
        titleText = <span><span className="font-medium">{rName}</span> deleted a job post</span>;
        subtitleText = activity.details?.title ||"Job Posting";
        linkTo = `/recruiter/jobs`;
       } else if (activity.action_type === 'talent_pool') {
        Icon = Users;
        iconClass ="bg-amber-100 text-amber-600";
        const poolName = activity.details?.pool_name ||"a talent pool";
        titleText = <span>{rName} added {activity.candidate_name} to <span className="font-medium">{poolName}</span></span>;
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
 )
}

/* 🔹🔹🔹 Main Dashboard 🔹🔹🔹 */
export default function CompanyDashboardPage() {
 const [sortField, setSortField] = useState('created_at')
 const [sortOrder, setSortOrder] = useState('desc')
 const { data, loading } = useFetch(() => companiesAPI.getDashboard())

 if (loading) {
  return (
   <div className="space-y-6 max-w-7xl mx-auto">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
     {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
    <SkeletonCard />
    <SkeletonCard />
   </div>
  )
 }

 if (!data) {
  return (
   <div className="flex flex-col items-center justify-center py-20 text-center">
    <Building2 className="h-16 w-16 text-slate-300 mb-4"/>
    <h2 className="text-xl font-bold text-slate-700">No Company Found</h2>
    <p className="mt-2 text-muted-foreground max-w-sm">
     You need to create a company profile first before you can see your hiring dashboard.
    </p>
    <Link
     to="/company/profile"
     className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-all"
    >
     Create Company Profile
    </Link>
   </div>
  )
 }

 const { company, stats, pipeline, recruiters, recent_jobs } = data

 // Pipeline total for percentage bars
 const pipelineTotal = Object.values(pipeline).reduce((a, b) => a + b, 0)
 const pipelineSteps = [
  { key: 'applied', label: 'Applied', hex: '#3b82f6' },
  { key: 'reviewing', label: 'Reviewing', hex: '#8b5cf6' },
  { key: 'shortlisted', label: 'Shortlisted', hex: '#f59e0b' },
  { key: 'interview', label: 'Interview', hex: '#f97316' },
  { key: 'offered', label: 'Offered', hex: '#10b981' },
  { key: 'rejected', label: 'Rejected', hex: '#f87171' },
 ]
 const pipelineData = pipelineSteps.map(s => ({
  label: s.label,
  count: pipeline[s.key] || 0,
  hex: s.hex
 }))

 const sortedJobs = [...recent_jobs].sort((a, b) => {
  let aVal = a[sortField]
  let bVal = b[sortField]
  if (typeof aVal === 'string') {
   return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
  }
  return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
 })

 const handleSort = (field) => {
  if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  else { setSortField(field); setSortOrder('desc') }
 }

 return (
  <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">

   {/* Header */}
   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div className="flex items-center gap-4">
     {company.logo ? (
      <img src={company.logo} alt={company.name} className="h-12 w-12 rounded-xl object-cover border"/>
     ) : (
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
       <Building2 className="h-6 w-6"/>
      </div>
     )}
     <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{company.name}</h1>
      <p className="text-sm text-slate-400 mt-0.5">
       {company.industry} · Hiring Command Center
       {company.is_verified && (
        <span className="ml-2 inline-flex items-center gap-1 text-emerald-600 font-semibold">
         <CheckCircle2 className="h-3.5 w-3.5"/> Verified
        </span>
       )}
      </p>
     </div>
    </div>
    <div className="flex gap-3">
     <Link
      to="/company/team"
      className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
     >
      <Users className="h-4 w-4"/> Manage Team
     </Link>
     <Link
      to="/recruiter/jobs/new"
      className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 shadow-md transition-all"
     >
      <Briefcase className="h-4 w-4"/> Post a Job
     </Link>
    </div>
   </div>

   {/* Stats Grid */}
   <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <DashStat
     icon={Users}
     label="Active Recruiters"
     value={stats.active_recruiters}
     sub={`${stats.total_recruiters} total`}
     color="blue"
    />
    <DashStat
     icon={Briefcase}
     label="Active Jobs"
     value={stats.active_jobs}
     sub={`${stats.total_jobs} total`}
     color="violet"
    />
    <DashStat
     icon={FileText}
     label="Applications"
     value={stats.total_applications}
     color="amber"
    />
    <DashStat
     icon={Heart}
     label="Shortlisted"
     value={stats.shortlisted_candidates}
     color="rose"
    />
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

    {/* Recruiter Performance Table */}
    <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden">
     <div className="flex items-center justify-between border-b px-6 py-4 bg-slate-50/60">
      <div className="flex items-center gap-2">
       <Trophy className="h-5 w-5 text-amber-500"/>
       <h2 className="font-bold text-slate-800">Recruiter Performance</h2>
      </div>
      <Link
       to="/company/team"
       className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
      >
       Manage <ChevronRight className="h-3 w-3"/>
      </Link>
     </div>
     <div className="px-6 py-2">
      {recruiters.length === 0 ? (
       <div className="flex flex-col items-center justify-center py-10 text-center">
        <Users className="h-10 w-10 text-slate-200 mb-3"/>
        <p className="text-sm text-slate-400">No recruiters yet. Invite your team.</p>
        <Link
         to="/company/team"
         className="mt-3 text-sm font-semibold text-primary hover:underline"
        >
         Invite Recruiters
        </Link>
       </div>
      ) : (
       recruiters.map(r => <RecruiterRow key={r.id} recruiter={r} />)
      )}
     </div>
    </div>

    {/* Hiring Pipeline */}
    <div className="glass-card rounded-2xl overflow-hidden">
     <div className="flex items-center gap-2 border-b px-6 py-4 bg-slate-50/60">
      <TrendingUp className="h-5 w-5 text-violet-500"/>
      <h2 className="font-bold text-slate-800">Hiring Pipeline</h2>
     </div>
     <div className="p-6 space-y-4">
      {pipelineTotal === 0 ? (
       <p className="text-sm text-slate-400 text-center py-6">No applications yet.</p>
      ) : (
       <div className="h-64 w-full">
        <ResponsiveContainer width="100%"height="100%">
         <BarChart data={pipelineData} layout="vertical"margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
          <XAxis type="number"hide />
          <YAxis type="category"dataKey="label"axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={80} />
          <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Bar dataKey="count"radius={[0, 4, 4, 0]} barSize={24}>
           {pipelineData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.hex} />
           ))}
          </Bar>
         </BarChart>
        </ResponsiveContainer>
       </div>
      )}
     </div>
     <div className="border-t px-6 py-4 bg-slate-50/40">
      <p className="text-xs text-slate-400">
       Total <span className="font-bold text-slate-700">{pipelineTotal}</span> applications across all jobs
      </p>
     </div>
    </div>

   </div>

   {/* Recent Active Jobs */}
   <div className="glass-card rounded-2xl overflow-hidden">
    <div className="flex items-center justify-between border-b px-6 py-4 bg-slate-50/60">
     <div className="flex items-center gap-2">
      <Briefcase className="h-5 w-5 text-blue-500"/>
      <h2 className="font-bold text-slate-800">Active Jobs</h2>
     </div>
     <Link
      to="/recruiter/jobs"
      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
     >
      View all <ChevronRight className="h-3 w-3"/>
     </Link>
    </div>

    {recent_jobs.length === 0 ? (
     <div className="flex flex-col items-center justify-center py-12 text-center">
      <Briefcase className="h-10 w-10 text-slate-200 mb-3"/>
      <p className="text-sm text-slate-400">No active jobs. Post your first job to start hiring.</p>
      <Link
       to="/recruiter/jobs/new"
       className="mt-3 text-sm font-semibold text-primary hover:underline"
      >
       Post a Job
      </Link>
     </div>
    ) : (
     <div className="overflow-x-auto">
      <table className="w-full text-sm">
       <thead className="border-b text-xs uppercase tracking-wider text-slate-400 bg-slate-50/40">
        <tr>
         <th className="px-6 py-3 text-left font-semibold cursor-pointer hover:text-slate-700 transition-colors"onClick={() => handleSort('title')}>Job Title {sortField === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
         <th className="px-6 py-3 text-left font-semibold hidden sm:table-cell cursor-pointer hover:text-slate-700 transition-colors"onClick={() => handleSort('city')}>Location {sortField === 'city' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
         <th className="px-6 py-3 text-center font-semibold cursor-pointer hover:text-slate-700 transition-colors"onClick={() => handleSort('applications_count')}>Applications {sortField === 'applications_count' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
         <th className="px-6 py-3 text-left font-semibold hidden md:table-cell cursor-pointer hover:text-slate-700 transition-colors"onClick={() => handleSort('created_at')}>Posted {sortField === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
         <th className="px-6 py-3"></th>
        </tr>
       </thead>
       <tbody className="divide-y">
        {sortedJobs.map(job => (
         <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
          <td className="px-6 py-4">
           <p className="font-semibold text-slate-900">{job.title}</p>
          </td>
          <td className="px-6 py-4 text-slate-500 hidden sm:table-cell">
           {[job.city, job.country].filter(Boolean).join(', ') || '—'}
          </td>
          <td className="px-6 py-4 text-center">
           <span className="inline-flex items-center justify-center min-w-[28px] rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
            {job.applications_count}
           </span>
          </td>
          <td className="px-6 py-4 text-slate-400 text-xs hidden md:table-cell">
           {new Date(job.created_at).toLocaleDateString()}
          </td>
          <td className="px-6 py-4 text-right">
           <Link
            to={`/recruiter/jobs/${job.id}`}
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
           >
            View <ChevronRight className="h-3 w-3"/>
           </Link>
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    )}
   </div>

   {/* Quick Actions */}
   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    {[
     { to: '/company/team', icon: Users, label: 'Manage Team', color: 'text-blue-600 bg-blue-50' },
     { to: '/company/pools', icon: Sparkles, label: 'Talent Pools', color: 'text-ai bg-ai/10' },
     { to: '/recruiter/candidates', icon: FileText, label: 'Find Talent', color: 'text-emerald-600 bg-emerald-50' },
     { to: '/company/profile', icon: Building2, label: 'Company Profile', color: 'text-amber-600 bg-amber-50' },
    ].map(item => (
     <Link
      key={item.to}
      to={item.to}
      className="flex flex-col items-center gap-3 rounded-2xl border bg-white p-5 text-center hover:shadow-md transition-shadow group"
     >
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color} group-hover:scale-110 transition-transform`}>
       <item.icon className="h-5 w-5"/>
      </div>
      <span className="text-sm font-semibold text-slate-700">{item.label}</span>
     </Link>
    ))}
   </div>

   {/* Team Activity Feeds */}
   <div className="mt-10">
    <div className="flex items-center gap-2 mb-6">
     <Activity className="h-6 w-6 text-indigo-500"/>
     <h2 className="text-xl font-bold tracking-tight text-slate-900">Team Activity</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
     {recruiters.map(recruiter => (
      <RecruiterActivityCard key={recruiter.id} recruiter={recruiter} />
     ))}
    </div>
   </div>

  </div>
 )
}
