import { useFetch } from '@/hooks/useFetch'
import { candidatesAPI } from '@/api/candidates'
import { matchingAPI } from '@/api/matching'
import { applicationsAPI } from '@/api/applications'
import { useAuth } from '@/contexts/AuthContext'
import { Briefcase, Sparkles, FileText, CheckCircle, ArrowRight, TrendingUp } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import SkeletonCard from '@/components/common/SkeletonCard'

function DashboardStat({ icon: Icon, label, value, trend, color = 'violet' }) {
 const colorMap = {
  violet: 'bg-violet-50 text-violet-600',
  amber: 'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
 }
 return (
  <div className="card-premium p-6 transition-all hover:shadow-md hover:-translate-y-0.5">
   <div className="flex items-center justify-between">
    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${colorMap[color] || colorMap.violet}`}>
     <Icon className="h-5 w-5"/>
    </div>
    {trend && (
     <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
      <TrendingUp className="h-3 w-3 mr-1"/> {trend}
     </span>
    )}
   </div>
   <div className="mt-4">
    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</h3>
    <p className="mt-1.5 text-2xl font-black tracking-tight text-slate-900">{value}</p>
   </div>
  </div>
 )
}

export default function CandidateDashboard() {
 const { user } = useAuth()
 const navigate = useNavigate()
 const [showConsentModal, setShowConsentModal] = useState(false)
 const [agreedReward, setAgreedReward] = useState(false)
 const [agreedPenalty, setAgreedPenalty] = useState(false)

 const { data: profile, loading: profileLoading } = useFetch(() => candidatesAPI.getProfile())
 const { data: matches } = useFetch(() => matchingAPI.getCandidateMatches())
 const { data: applications } = useFetch(() => applicationsAPI.list())

 if (profileLoading) {
  return (
   <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
     {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
   </div>
  )
 }

 const matchCount = Array.isArray(matches) ? matches.length : 0
 const appCount = Array.isArray(applications) ? applications.length : 0
 const completion = profile?.profile_completion || 0

 return (
  <div className="space-y-8 pb-8 animate-fade-in">
   {/* ── Welcome Banner ── */}
   <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 shadow-lg" style={{ background: 'linear-gradient(135deg, hsl(224,60%,8%) 0%, hsl(263,55%,16%) 60%, hsl(263,70%,22%) 100%)' }}>
    <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl"/>
    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl"/>
    <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/8 blur-3xl"/>

    <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
     <div>
      <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/15 border border-violet-500/20 px-3 py-1 mb-3">
       <Sparkles className="h-3.5 w-3.5 text-violet-400"/>
       <span className="text-xs font-bold text-violet-300">AI-Powered Dashboard</span>
      </div>
      <h1 className="text-2xl font-black text-white">Welcome back, {user?.first_name}! 👋</h1>
      <p className="mt-2 text-slate-400 max-w-xl">
       You have <span className="font-bold text-violet-300">{matchCount} new job matches</span> waiting for your review. Take an AI Video Interview to boost your profile!
      </p>
     </div>
     <div className="shrink-0 flex flex-col sm:flex-row gap-2">
      <button onClick={() => setShowConsentModal(true)} className="btn bg-violet-600 hover:bg-violet-500 text-white border-transparent shadow-lg shadow-violet-900/30">
       Take AI Interview
      </button>
      <Link to="/candidate/matches" className="btn btn-secondary text-white border-white/20 hover:bg-white/10">
       View Matches <ArrowRight className="h-4 w-4"/>
      </Link>
     </div>
    </div>
   </div>

   {/* Profile strength alert */}
   {completion < 80 && (() => {
    const tiers = [
     { min: 0, label: 'Starter Profile', desc: 'Build your profile to get discovered by top companies.', border: 'border-red-200', bg: 'from-red-50 to-orange-50', stroke: 'stroke-red-500', strokeBg: 'stroke-red-200', text: 'text-red-700', btnBg: 'bg-red-500 hover:bg-red-600' },
     { min: 31, label: 'Growing Profile', desc: 'Great start! Add more details to boost visibility.', border: 'border-amber-200', bg: 'from-amber-50 to-orange-50', stroke: 'stroke-amber-500', strokeBg: 'stroke-amber-200', text: 'text-amber-700', btnBg: 'bg-amber-500 hover:bg-amber-600' },
     { min: 61, label: 'Strong Profile', desc: 'Almost there! A few more details and you\'re outstanding.', border: 'border-blue-200', bg: 'from-blue-50 to-indigo-50', stroke: 'stroke-blue-500', strokeBg: 'stroke-blue-200', text: 'text-blue-700', btnBg: 'bg-blue-500 hover:bg-blue-600' },
    ]
    const tier = [...tiers].reverse().find(t => completion >= t.min) || tiers[0]
    return (
     <div className={`flex flex-col gap-4 rounded-2xl border ${tier.border} bg-gradient-to-r ${tier.bg} p-5 sm:flex-row sm:items-center sm:justify-between shadow-sm`}>
      <div className="flex items-center gap-4">
       <div className="relative flex h-14 w-14 items-center justify-center shrink-0">
        <svg className="absolute inset-0 h-full w-full -rotate-90"viewBox="0 0 36 36">
         <path className={tier.strokeBg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"fill="none"strokeWidth="3"/>
         <path className={`${tier.stroke} transition-all duration-1000`} strokeDasharray={`${completion}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"fill="none"strokeWidth="3"/>
        </svg>
        <span className={`text-xs font-bold ${tier.text}`}>{completion}%</span>
       </div>
       <div>
        <p className={`font-semibold ${tier.text}`}>{tier.label}</p>
        <p className={`text-sm ${tier.text} opacity-80 mt-0.5`}>{tier.desc}</p>
       </div>
      </div>
      <Link to="/candidate/profile"className={`shrink-0 rounded-full ${tier.btnBg} px-5 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm`}>
       Complete Profile
      </Link>
     </div>
    )
   })()}

   {/* Stats */}
   <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <DashboardStat icon={Sparkles} label="AI Job Matches" value={matchCount} trend="+3 this week" color="violet"/>
    <DashboardStat icon={FileText} label="Active Applications" value={appCount} color="blue"/>
    <DashboardStat icon={CheckCircle} label="Profile Score" value={`${completion}%`} color="emerald"/>
    <DashboardStat icon={Briefcase} label="Current Status" value={profile?.employment_status?.replace('_', ' ') || 'N/A'} color="amber"/>
   </div>

   <div className="grid gap-8 lg:grid-cols-3">
    {/* Main Content Area (Matches) */}
    <div className="lg:col-span-2 space-y-6">
     <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold tracking-tight">Top Recommended Matches</h2>
      <Link to="/candidate/matches"className="text-sm font-semibold text-primary hover:underline">View all matches</Link>
     </div>

     <div className="grid gap-3">
      {Array.isArray(matches) && matches.length > 0 ? matches.slice(0, 3).map((match) => (
       <div key={match.id} className="group card-premium flex flex-col gap-4 p-5 transition-all hover:shadow-md hover:border-violet-200 sm:flex-row sm:items-center justify-between">
        <div>
         <h3 className="text-base font-bold group-hover:text-violet-700 transition-colors">
          <Link to={`/candidate/jobs/${match.job}`} className="hover:underline">{match.job_title}</Link>
         </h3>
         <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
          <span className="font-semibold text-slate-700">{match.company_name}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300"/>
          <span>{match.job?.is_remote || 'On-site'}</span>
         </div>
        </div>
        <div className="flex items-center justify-between gap-4">
         <div className="text-right">
          <div className="flex items-center justify-end gap-1">
           <Sparkles className="h-4 w-4 text-violet-500"/>
           <span className="text-xl font-black text-violet-600">{Math.round(match.overall_score)}%</span>
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Match Score</span>
         </div>
         <Link to={`/candidate/jobs/${match.job}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors group-hover:bg-violet-600 group-hover:text-white">
          <ArrowRight className="h-4 w-4"/>
         </Link>
        </div>
       </div>
      )) : (
       <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-violet-200 p-12 text-center bg-violet-50/30">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 mb-4">
         <Sparkles className="h-6 w-6 text-violet-400"/>
        </div>
        <h3 className="text-base font-bold text-slate-800">No matches yet</h3>
        <p className="mt-1 text-sm text-slate-500 max-w-sm">Complete your profile skills and experience to help our AI find the perfect roles for you.</p>
        <Link to="/candidate/profile" className="mt-5 btn btn-primary text-sm">Update Profile</Link>
       </div>
      )}
     </div>
    </div>

    {/* Sidebar Activity */}
    <div className="space-y-5">
     <h2 className="text-base font-bold tracking-tight text-slate-900">Recent Activity</h2>

     <div className="card-premium overflow-hidden">
      <div className="p-5 border-b border-slate-100">
       <h3 className="font-bold text-slate-900 text-sm">Application Status</h3>
      </div>
      <div className="divide-y divide-slate-50 p-4">
       {Array.isArray(applications) && applications.length > 0 ? applications.slice(0, 4).map(app => (
        <div key={app.id} className="py-3 first:pt-0 last:pb-0">
         <p className="font-semibold text-sm text-slate-900 truncate">{app.job_title}</p>
         <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-slate-400">{app.company_name}</p>
          <span className="rounded-full bg-violet-50 border border-violet-200 px-2.5 py-0.5 text-[10px] font-bold text-violet-700 uppercase tracking-wider">{app.status}</span>
         </div>
        </div>
       )) : (
        <div className="py-6 text-center text-sm text-slate-400">No active applications.</div>
       )}
      </div>
      <div className="p-3 border-t border-slate-100 bg-slate-50/60">
       <Link to="/candidate/applications" className="block text-center text-xs font-bold text-violet-600 hover:text-violet-700 transition-colors">View all applications</Link>
      </div>
     </div>
    </div>
   </div>

   {/* AI Interview Consent Modal */}
   {showConsentModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
     <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden animate-in zoom-in-95">
      <div className="p-6 border-b border-slate-100">
       <h2 className="text-xl font-bold text-slate-900">AI Interview Agreement</h2>
       <p className="mt-1 text-sm text-slate-500">Please acknowledge the rules of the AI Matching Engine before proceeding.</p>
      </div>
      <div className="p-6 space-y-4">
       <label className="flex items-start gap-3 p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 cursor-pointer hover:bg-emerald-50 transition-colors">
        <input type="checkbox" className="mt-1 flex-shrink-0 w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500" checked={agreedReward} onChange={(e) => setAgreedReward(e.target.checked)} />
        <span className="text-sm text-emerald-900">
         <strong>I understand the Reward:</strong> Passing this interview will verify my skills and grant me a <strong>1.3x ranking boost</strong> on the platform.
        </span>
       </label>
       <label className="flex items-start gap-3 p-4 rounded-xl border border-red-100 bg-red-50/50 cursor-pointer hover:bg-red-50 transition-colors">
        <input type="checkbox" className="mt-1 flex-shrink-0 w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500" checked={agreedPenalty} onChange={(e) => setAgreedPenalty(e.target.checked)} />
        <span className="text-sm text-red-900">
         <strong>I understand the Penalty:</strong> The test is strictly proctored. Getting caught cheating will result in a <strong>-30% visibility penalty</strong> for 30 days.
        </span>
       </label>
      </div>
      <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
       <button onClick={() => setShowConsentModal(false)} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
       <button 
        disabled={!agreedReward || !agreedPenalty}
        onClick={() => navigate('/candidate/interviews/lobby')} 
        className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-indigo-600/20"
       >
        I Agree, Enter Lobby
       </button>
      </div>
     </div>
    </div>
   )}
  </div>
 )
}
