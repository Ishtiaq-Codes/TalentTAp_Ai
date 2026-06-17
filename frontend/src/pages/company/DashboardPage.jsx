import { useState, useEffect } from 'react'
import { useFetch } from '@/hooks/useFetch'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '@/contexts/ToastContext'
import { companiesAPI } from '@/api/companies'
import { Link } from 'react-router-dom'
import {
 Users, Briefcase, FileText, Heart, Sparkles,
 TrendingUp, CheckCircle2, ChevronRight, Building2,
 Trophy, Activity
} from 'lucide-react'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import SkeletonCard from '@/components/common/SkeletonCard'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import DashStat from '@/components/dashboard/DashStat'
import RecruiterActivityCard from '@/components/dashboard/RecruiterActivityCard'
import RecruiterRow from '@/components/dashboard/RecruiterRow'



/* 🔹🔹🔹 Main Dashboard 🔹🔹🔹 */
export default function CompanyDashboardPage() {
 const [searchParams] = useSearchParams()
 const { success } = useToast()
 const [sortField, setSortField] = useState('created_at')
 const [sortOrder, setSortOrder] = useState('desc')
 const { data, loading } = useFetch(() => companiesAPI.getDashboard())

 // Handle Stripe success
 useEffect(() => {
  if (searchParams.get('upgrade') === 'success') {
   success('Subscription upgraded successfully! Welcome to TalentTap Pro.')
   // remove query params
   window.history.replaceState({}, '', '/company/dashboard')
  }
 }, [searchParams, success])

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

   {/* ── Header ── */}
   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div className="flex items-center gap-4">
     {company.logo ? (
      <img src={company.logo} alt={company.name} className="h-12 w-12 rounded-2xl object-cover border border-slate-200 shadow-sm"/>
     ) : (
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
       <Building2 className="h-6 w-6"/>
      </div>
     )}
     <div>
      <div className="flex items-center gap-2">
       <h1 className="text-xl font-bold tracking-tight text-slate-900">{company.name}</h1>
       {company.is_verified && (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
         <CheckCircle2 className="h-3 w-3"/> Verified
        </span>
       )}
      </div>
      <p className="text-sm text-slate-400 mt-0.5">{company.industry} · Hiring Command Center</p>
     </div>
    </div>
    <div className="flex gap-2">
     <Link to="/company/team" className="btn btn-secondary">
      <Users className="h-4 w-4"/> Manage Team
     </Link>
     <Link to="/recruiter/jobs/new" className="btn btn-primary">
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

    {/* Recruiter Performance */}
    <div className="lg:col-span-2 card-premium overflow-hidden min-w-0">
     <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
      <div className="flex items-center gap-2">
       <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
        <Trophy className="h-4 w-4"/>
       </div>
       <h2 className="font-bold text-slate-800">Recruiter Performance</h2>
      </div>
      <Link to="/company/team" className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors">
       Manage <ChevronRight className="h-3 w-3"/>
      </Link>
     </div>
     <div className="px-6 py-2">
      {recruiters.length === 0 ? (
       <div className="flex flex-col items-center justify-center py-10 text-center">
        <Users className="h-10 w-10 text-slate-200 mb-3"/>
        <p className="text-sm text-slate-400">No recruiters yet. Invite your team.</p>
        <Link to="/company/team" className="mt-3 text-sm font-semibold text-violet-600 hover:underline">Invite Recruiters</Link>
       </div>
      ) : (
       recruiters.map(r => <RecruiterRow key={r.id} recruiter={r} />)
      )}
     </div>
    </div>

    {/* Hiring Pipeline */}
    <div className="card-premium overflow-hidden min-w-0">
     <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-500">
       <TrendingUp className="h-4 w-4"/>
      </div>
      <h2 className="font-bold text-slate-800">Hiring Pipeline</h2>
     </div>
     <div className="p-6 space-y-4">
      {pipelineTotal === 0 ? (
       <p className="text-sm text-slate-400 text-center py-6">No applications yet.</p>
      ) : (
       <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
         <BarChart data={pipelineData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={80} />
          <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={22}>
           {pipelineData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.hex} />
           ))}
          </Bar>
         </BarChart>
        </ResponsiveContainer>
       </div>
      )}
     </div>
     <div className="border-t border-slate-100 px-6 py-3 bg-slate-50/40">
      <p className="text-xs text-slate-400">Total <span className="font-bold text-slate-700">{pipelineTotal}</span> applications across all jobs</p>
     </div>
    </div>

   </div>

    {/* Recent Active Jobs */}
   <div className="card-premium overflow-hidden min-w-0">
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
     <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
       <Briefcase className="h-4 w-4"/>
      </div>
      <h2 className="font-bold text-slate-800">Active Jobs</h2>
     </div>
     <Link to="/recruiter/jobs" className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors">
      View all <ChevronRight className="h-3 w-3"/>
     </Link>
    </div>

    {recent_jobs.length === 0 ? (
     <div className="flex flex-col items-center justify-center py-12 text-center">
      <Briefcase className="h-10 w-10 text-slate-200 mb-3"/>
      <p className="text-sm text-slate-400">No active jobs. Post your first job to start hiring.</p>
      <Link to="/recruiter/jobs/new" className="mt-3 text-sm font-semibold text-violet-600 hover:underline">Post a Job</Link>
     </div>
    ) : (
     <div className="overflow-x-auto w-full">
      <table className="w-full text-sm">
       <thead className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50/60">
        <tr>
         <th className="px-6 py-3 text-left font-semibold cursor-pointer hover:text-slate-700 transition-colors" onClick={() => handleSort('title')}>Job Title {sortField === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
         <th className="px-6 py-3 text-left font-semibold hidden sm:table-cell cursor-pointer hover:text-slate-700 transition-colors" onClick={() => handleSort('city')}>Location {sortField === 'city' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
         <th className="px-6 py-3 text-center font-semibold cursor-pointer hover:text-slate-700 transition-colors" onClick={() => handleSort('applications_count')}>Applications {sortField === 'applications_count' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
         <th className="px-6 py-3 text-left font-semibold hidden md:table-cell cursor-pointer hover:text-slate-700 transition-colors" onClick={() => handleSort('created_at')}>Posted {sortField === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
         <th className="px-6 py-3"></th>
        </tr>
       </thead>
       <tbody className="divide-y divide-slate-100">
        {sortedJobs.map(job => (
         <tr key={job.id} className="hover:bg-slate-50 transition-colors group">
          <td className="px-6 py-4"><p className="font-semibold text-slate-900 group-hover:text-violet-700 transition-colors">{job.title}</p></td>
          <td className="px-6 py-4 text-slate-500 hidden sm:table-cell">{[job.city, job.country].filter(Boolean).join(', ') || '—'}</td>
          <td className="px-6 py-4 text-center">
           <span className="inline-flex items-center justify-center min-w-[28px] rounded-full bg-violet-50 border border-violet-200 px-2.5 py-0.5 text-xs font-bold text-violet-700">{job.applications_count}</span>
          </td>
          <td className="px-6 py-4 text-slate-400 text-xs hidden md:table-cell">{new Date(job.created_at).toLocaleDateString()}</td>
          <td className="px-6 py-4 text-right">
           <Link to={`/recruiter/jobs/${job.id}`} className="text-xs font-semibold text-violet-600 hover:underline inline-flex items-center gap-1">
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
   <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    {[
     { to: '/company/team', icon: Users, label: 'Manage Team', bg: 'bg-blue-50', color: 'text-blue-600', border: 'border-blue-100' },
     { to: '/company/pools', icon: Sparkles, label: 'Talent Pools', bg: 'bg-violet-50', color: 'text-violet-600', border: 'border-violet-100' },
     { to: '/recruiter/candidates', icon: FileText, label: 'Find Talent', bg: 'bg-emerald-50', color: 'text-emerald-600', border: 'border-emerald-100' },
     { to: '/company/profile', icon: Building2, label: 'Company Profile', bg: 'bg-amber-50', color: 'text-amber-600', border: 'border-amber-100' },
    ].map(item => (
     <Link
      key={item.to}
      to={item.to}
      className="flex flex-col items-center gap-3 card-premium p-5 text-center hover:shadow-md transition-all hover:-translate-y-0.5 group"
     >
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${item.bg} ${item.color} ${item.border} group-hover:scale-110 transition-transform`}>
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
