import { useParams, useNavigate, Link } from 'react-router-dom'
import { useFetch } from '@/hooks/useFetch'
import { companiesAPI } from '@/api/companies'
import { jobsAPI } from '@/api/jobs'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import SkeletonCard from '@/components/common/SkeletonCard'
import { ArrowLeft, Globe, MapPin, Users, Building2, Briefcase, ExternalLink } from 'lucide-react'
import { getImageUrl, formatDate } from '@/lib/utils'

export default function PublicCompanyProfilePage() {
 const { id } = useParams()
 const navigate = useNavigate()
 
 const { data: company, loading: companyLoading } = useFetch(() => companiesAPI.getPublicProfile(id), [id])
 const { data: jobs, loading: jobsLoading } = useFetch(() => jobsAPI.listPublic({ company: id }), [id])

 if (companyLoading) return <div className="max-w-5xl mx-auto space-y-6"><SkeletonCard /><SkeletonCard /></div>
 if (!company) return <div className="text-center py-20 text-slate-500">Company not found.</div>

 const jobList = Array.isArray(jobs) ? jobs : []

 return (
  <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
   <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
    <ArrowLeft className="h-4 w-4"/> Back
   </button>

   {/* Banner & Header */}
   <div className="glass-card rounded-2xl overflow-hidden">
    <div className="h-64 bg-slate-100 relative">
     {company.banner_image ? (
      <img src={getImageUrl(company.banner_image)} alt="Banner"className="h-full w-full object-cover"/>
     ) : (
      <div className="h-full w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800"/>
     )}
    </div>
    <div className="px-8 pb-8 sm:px-10">
     <div className="flex flex-col sm:flex-row sm:items-end gap-6">
      <div className="-mt-16 relative z-10 flex h-32 w-32 items-center justify-center rounded-2xl border-4 border-white shadow-lg overflow-hidden shrink-0 bg-gradient-to-br from-violet-500 to-amber-500">
       {company.logo ? (
        <img src={getImageUrl(company.logo)} alt={company.name} className="h-full w-full object-cover" />
       ) : (
        <span className="text-5xl font-bold text-white leading-none">{company.name?.charAt(0) || 'C'}</span>
       )}
      </div>
      <div className="flex-1 pb-2">
       <h1 className="text-3xl font-bold text-slate-900">{company.name}</h1>
       <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium text-slate-600">
        {company.industry && <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4 text-slate-400"/> {company.industry.replace('_', ' ')}</span>}
        {company.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-slate-400"/> {company.location}</span>}
        {company.company_size && <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-slate-400"/> {company.company_size} Employees</span>}
        {company.website && (
         <a href={company.website} target="_blank"rel="noopener noreferrer"className="flex items-center gap-1.5 text-primary hover:underline">
          <Globe className="h-4 w-4"/> Website <ExternalLink className="h-3 w-3"/>
         </a>
        )}
       </div>
      </div>
     </div>
    </div>
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* Left Column: About */}
    <div className="lg:col-span-1 space-y-6">
     <div className="glass-card rounded-2xl p-6">
      <h2 className="font-bold text-slate-900 mb-4">About {company.name}</h2>
      {company.description ? (
       <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{company.description}</p>
      ) : (
       <p className="text-sm text-slate-400 italic">No description provided.</p>
      )}
      
      <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3">
       <div className="flex justify-between items-center text-sm">
        <span className="text-slate-500">Founded</span>
        <span className="font-medium text-slate-900">{company.created_at ? new Date(company.created_at).getFullYear() : 'N/A'}</span>
       </div>
       {company.is_verified && (
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg justify-center mt-2">
         <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
         </span>
         Verified Company
        </div>
       )}
      </div>
     </div>
    </div>

    {/* Right Column: Open Jobs */}
    <div className="lg:col-span-2 space-y-6">
     <h2 className="text-xl font-bold text-slate-900">Open Positions ({jobList.length})</h2>
     
     {jobsLoading ? (
      <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
     ) : jobList.length === 0 ? (
      <div className="rounded-2xl border border-dashed bg-white py-16 text-center">
       <Briefcase className="h-10 w-10 text-slate-200 mx-auto mb-3"/>
       <h3 className="text-slate-700 font-semibold">No open positions</h3>
       <p className="text-sm text-slate-400 mt-1">This company doesn't have any active job listings right now.</p>
      </div>
     ) : (
      <div className="space-y-4">
       {jobList.map(job => (
        <Link key={job.id} to={`/candidate/jobs/${job.id}`} className="block rounded-2xl border bg-white p-6 hover:shadow-md hover:border-primary/30 transition-all group">
         <div className="flex items-start justify-between">
          <div>
           <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{job.title}</h3>
           <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5"/> {job.city || job.country || 'Remote'}</span>
            <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5"/> {job.employment_type?.replace('_', ' ')}</span>
           </div>
           {job.skills?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
             {job.skills.slice(0, 4).map(s => (
              <span key={s.id} className={`rounded-md px-2 py-1 text-[11px] font-medium border ${s.is_required ? 'bg-primary/5 text-primary border-primary/20' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
               {s.name}
              </span>
             ))}
             {job.skills.length > 4 && <span className="rounded-md px-2 py-1 text-[11px] font-medium border bg-slate-50 text-slate-500 border-slate-200">+{job.skills.length - 4} more</span>}
            </div>
           )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
           <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            View Job
           </span>
           <span className="text-[11px] text-slate-400 font-medium">
            {formatDate(job.created_at)}
           </span>
          </div>
         </div>
        </Link>
       ))}
      </div>
     )}
    </div>
   </div>
  </div>
 )
}
