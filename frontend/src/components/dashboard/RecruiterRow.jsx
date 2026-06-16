import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import ProfileAvatar from '@/components/common/ProfileAvatar'

export default function RecruiterRow({ recruiter }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors -mx-6 px-6 cursor-pointer group">
      <div className="flex items-center gap-3">
        <ProfileAvatar 
          src={recruiter.avatar} 
          name={recruiter.user_name} 
          size="sm"
          className="ring-2 ring-white shadow-sm"
        />
        <div>
          <p className="text-sm font-semibold text-slate-800">{recruiter.user_name}</p>
          <p className="text-xs text-slate-500 line-clamp-1">{recruiter.title || recruiter.user_email}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-bold text-slate-700">{recruiter.jobs_count}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Jobs</p>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-sm font-bold text-slate-700">{recruiter.shortlists_count}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Shortlists</p>
        </div>
        <Link 
          to="/company/team"
          className="text-slate-400 group-hover:text-primary transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
