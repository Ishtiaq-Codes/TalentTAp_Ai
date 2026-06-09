import { useFetch } from '@/hooks/useFetch'
import { authAPI } from '@/api/auth'
import SkeletonCard from '@/components/common/SkeletonCard'
import { Users, Building2, Briefcase, BarChart3, TrendingUp, Activity, Server, Database, Globe } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const growthData = [
 { name: 'Jan', users: 4000, companies: 240 },
 { name: 'Feb', users: 5500, companies: 300 },
 { name: 'Mar', users: 4500, companies: 280 },
 { name: 'Apr', users: 6000, companies: 390 },
 { name: 'May', users: 7500, companies: 480 },
 { name: 'Jun', users: 6500, companies: 430 },
 { name: 'Jul', users: 8000, companies: 510 },
 { name: 'Aug', users: 9500, companies: 620 },
 { name: 'Sep', users: 8500, companies: 580 },
 { name: 'Oct', users: 10000, companies: 710 },
 { name: 'Nov', users: 11000, companies: 840 },
 { name: 'Dec', users: 13000, companies: 980 },
]

function AdminStatCard({ icon: Icon, label, value, trend, trendLabel, colorClass }) {
 return (
  <div className="glass-card rounded-2xl p-6 transition-all hover:shadow-md">
   <div className="flex items-center justify-between">
    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClass}`}>
     <Icon className="h-6 w-6"/>
    </div>
    {trend && (
     <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
      <TrendingUp className="h-3 w-3 mr-1"/> {trend}
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

export default function AdminDashboardPage() {
 const { loading } = useFetch(() => authAPI.getMe())

 if (loading) {
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
   <div>
    <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
    <p className="mt-2 text-muted-foreground">Monitor platform growth, system health, and overall match quality.</p>
   </div>

   {/* Primary KPI Cards */}
   <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
    <AdminStatCard icon={Users} label="Total Users"value="15,482"trend="+124"trendLabel="this week"colorClass="bg-blue-100 text-blue-600"/>
    <AdminStatCard icon={Building2} label="Active Companies"value="512"trend="+8"trendLabel="this week"colorClass="bg-indigo-100 text-indigo-600"/>
    <AdminStatCard icon={Briefcase} label="Active Job Posts"value="2,104"trend="+42"trendLabel="this week"colorClass="bg-emerald-100 text-emerald-600"/>
    <AdminStatCard icon={BarChart3} label="Global Match Accuracy"value="89.2%"trend="+1.1%"trendLabel="this month"colorClass="bg-ai/10 text-ai"/>
   </div>

   {/* Advanced Layout */}
   <div className="grid gap-8 lg:grid-cols-3">
    {/* Analytics Main (Placeholder for charts) */}
    <div className="lg:col-span-2 space-y-6">
     <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-8">
       <h2 className="text-xl font-bold tracking-tight">Platform Growth</h2>
       <select className="rounded-lg border-slate-200 bg-slate-50 text-sm focus:ring-primary">
        <option>Last 30 Days</option>
        <option>Last Quarter</option>
        <option>Last Year</option>
       </select>
      </div>
      {/* Real Interactive Analytics */}
      <div className="h-72 w-full mt-4">
       <ResponsiveContainer width="100%"height="100%">
        <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
         <defs>
          <linearGradient id="colorUsers"x1="0"y1="0"x2="0"y2="1">
           <stop offset="5%"stopColor="#4F46E5"stopOpacity={0.3}/>
           <stop offset="95%"stopColor="#4F46E5"stopOpacity={0}/>
          </linearGradient>
         </defs>
         <CartesianGrid strokeDasharray="3 3"vertical={false} stroke="#e2e8f0"/>
         <XAxis dataKey="name"axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
         <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
         <Tooltip 
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
          itemStyle={{ fontSize: '14px', fontWeight: '500' }}
         />
         <Area type="monotone"dataKey="users"stroke="#4F46E5"strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)"/>
        </AreaChart>
       </ResponsiveContainer>
      </div>
     </div>
    </div>

    {/* System Health */}
    <div className="space-y-6">
     <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-5 border-b bg-slate-50/50 flex items-center justify-between">
       <h3 className="font-semibold text-sm">System Health</h3>
       <span className="flex items-center text-xs font-semibold text-emerald-600">
        <Activity className="h-3 w-3 mr-1"/> All Systems Nominal
       </span>
      </div>
      <div className="divide-y p-5">
       <div className="flex items-center justify-between py-3 first:pt-0">
        <div className="flex items-center gap-3">
         <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
          <Server className="h-4 w-4"/>
         </div>
         <div>
          <p className="text-sm font-medium">Core API</p>
          <p className="text-xs text-muted-foreground">99.99% Uptime</p>
         </div>
        </div>
        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"/>
       </div>

       <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
         <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
          <BrainIcon className="h-4 w-4"/>
         </div>
         <div>
          <p className="text-sm font-medium">Matching Engine</p>
          <p className="text-xs text-muted-foreground">32ms avg response</p>
         </div>
        </div>
        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"/>
       </div>

       <div className="flex items-center justify-between py-3 last:pb-0">
        <div className="flex items-center gap-3">
         <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
          <Database className="h-4 w-4"/>
         </div>
         <div>
          <p className="text-sm font-medium">Primary Database</p>
          <p className="text-xs text-muted-foreground">Replication active</p>
         </div>
        </div>
        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"/>
       </div>
      </div>
     </div>

     {/* Quick Stats */}
     <div className="rounded-2xl border bg-gradient-to-br from-primary to-blue-700 p-6 text-white shadow-md">
      <Globe className="h-8 w-8 text-white/50 mb-4"/>
      <h3 className="text-lg font-bold">Global Reach</h3>
      <p className="text-sm text-blue-100 mt-1">Users from 42 countries have registered this month.</p>
     </div>
    </div>
   </div>
  </div>
 )
}

function BrainIcon({ className }) {
 return (
  <svg xmlns="http://www.w3.org/2000/svg"width="24"height="24"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round"className={className}>
   <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
   <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
   <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
   <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
   <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
   <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
   <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
   <path d="M6 18a4 4 0 0 1-1.967-.516"/>
   <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
  </svg>
 )
}
