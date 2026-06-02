import { useFetch } from '@/hooks/useFetch'
import { applicationsAPI } from '@/api/applications'
import SkeletonCard from '@/components/common/SkeletonCard'
import MessageButton from '@/components/common/MessageButton'
import { Bookmark, Trash2, ArrowRight, User } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ShortlistsPage() {
  const { data: shortlists, loading, refetch } = useFetch(() => applicationsAPI.getShortlists())

  const removeShortlist = async (id) => {
    if (confirm('Remove this candidate from shortlists?')) {
      await applicationsAPI.removeFromShortlist(id)
      refetch()
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }
  
  const list = Array.isArray(shortlists) ? shortlists : []

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saved Candidates</h1>
          <p className="mt-2 text-muted-foreground">Candidates you've shortlisted for current or future roles.</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
          <Bookmark className="h-6 w-6" />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed p-16 text-center bg-white shadow-sm">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Bookmark className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold">No candidates saved</h3>
            <p className="mt-2 text-muted-foreground max-w-sm">
              You haven't shortlisted any candidates yet. Browse your job matches or use the talent search to start saving top candidates.
            </p>
            <Link to="/recruiter/candidates" className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary/90 transition-all">
              Discover Talent
            </Link>
          </div>
        ) : (
          list.map(item => (
            <div key={item.id} className="group relative flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:border-primary/40 hover:-translate-y-1">
              <Link to={`/recruiter/candidates/${item.candidate}`} className="absolute inset-0 z-0" aria-label={`View ${item.candidate_name}'s profile`} />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-100 bg-slate-50 overflow-hidden shadow-sm shrink-0">
                    <User className="h-8 w-8 text-slate-300" />
                  </div>
                  <button 
                    onClick={(e) => { e.preventDefault(); removeShortlist(item.id); }}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                    title="Remove from shortlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{item.candidate_name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{item.candidate_headline || 'Professional'}</p>
                </div>

                {item.job_title && (
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    <Bookmark className="h-3.5 w-3.5" /> Saved for: {item.job_title}
                  </div>
                )}
              </div>
              
              <div className="relative z-10 mt-6 pt-5 border-t flex items-center justify-between">
                <MessageButton recipientId={item.candidate_user_id} name={item.candidate_name} />
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
