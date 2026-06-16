import { useState } from 'react'
import { useFetch } from '@/hooks/useFetch'
import { applicationsAPI } from '@/api/applications'
import SkeletonCard from '@/components/common/SkeletonCard'
import MessageButton from '@/components/common/MessageButton'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import ConfirmModal from '@/components/common/ConfirmModal'
import { Bookmark, Trash2, ArrowRight, User, List, LayoutGrid, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ShortlistsPage() {
 const { data: shortlists, loading, refetch } = useFetch(() => applicationsAPI.getShortlists())
 const [viewMode, setViewMode] = useState('list')
 const [confirmModal, setConfirmModal] = useState({ isOpen: false, shortlistId: null })

 const removeShortlist = (id) => {
  setConfirmModal({ isOpen: true, shortlistId: id })
 }

 const handleConfirmRemove = async () => {
  if (confirmModal.shortlistId) {
   await applicationsAPI.removeFromShortlist(confirmModal.shortlistId)
   refetch(true)
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
  <div className="space-y-6 animate-fade-in">
   {/* Header */}
   <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
     <h1 className="text-2xl font-bold tracking-tight">Saved Candidates</h1>
     <p className="mt-1 text-sm text-muted-foreground">{list.length} candidate{list.length !== 1 ? 's' : ''} shortlisted</p>
    </div>
    <div className="flex items-center gap-2">
     <div className="flex rounded-lg glass-card p-0.5">
      <button
       onClick={() => setViewMode('list')}
       className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
      >
       <List className="h-3.5 w-3.5"/> List
      </button>
      <button
       onClick={() => setViewMode('grid')}
       className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
      >
       <LayoutGrid className="h-3.5 w-3.5"/> Grid
      </button>
     </div>
    </div>
   </div>

   {list.length === 0 ? (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-16 text-center bg-white shadow-sm">
     <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
      <Bookmark className="h-8 w-8 text-slate-400"/>
     </div>
     <h3 className="text-xl font-bold">No candidates saved</h3>
     <p className="mt-2 text-muted-foreground max-w-sm">
      You haven't shortlisted any candidates yet. Browse your job matches or use the talent search to start saving top candidates.
     </p>
     <Link to="/recruiter/candidates"className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary/90 transition-all">
      Discover Talent
     </Link>
    </div>
   ) : viewMode === 'list' ? (
    /* ─── Table View ─── */
    <div className="glass-card rounded-xl overflow-hidden min-w-0">
     <div className="overflow-x-auto w-full pb-2">
      <table className="w-full">
       <thead>
        <tr className="border-b bg-slate-50/80">
         <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate</th>
         <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Saved For</th>
         <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Date Added</th>
         <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
        </tr>
       </thead>
       <tbody className="divide-y divide-slate-100">
        {list.map(item => (
         <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
          <td className="px-4 py-3">
           <Link to={`/recruiter/candidates/${item.candidate}`} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
             <ProfileAvatar name={item.candidate_name} src={item.candidate_avatar} size="md"className="h-full w-full"/>
            </div>
            <div className="min-w-0">
             <p className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors truncate">{item.candidate_name}</p>
             <p className="text-xs text-slate-500 truncate">{item.candidate_headline || 'Professional'}</p>
            </div>
           </Link>
          </td>
          <td className="px-4 py-3 hidden sm:table-cell">
           {item.job_title ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
             <Bookmark className="h-2.5 w-2.5"/> {item.job_title}
            </span>
           ) : (
            <span className="text-xs text-slate-400">General</span>
           )}
          </td>
          <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">
           {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
          </td>
          <td className="px-4 py-3">
           <div className="flex items-center justify-end gap-1">
            <MessageButton recipientId={item.candidate_user_id} name={item.candidate_name} className="text-xs"/>
            <Link
             to={`/recruiter/candidates/${item.candidate}`}
             className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors"
             title="View profile"
            >
             <ExternalLink className="h-3.5 w-3.5"/>
            </Link>
            <button
             onClick={() => removeShortlist(item.id)}
             className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
             title="Remove"
            >
             <Trash2 className="h-3.5 w-3.5"/>
            </button>
           </div>
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    </div>
   ) : (
    /* ─── Grid View ─── */
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
     {list.map(item => (
      <div key={item.id} className="group relative flex flex-col justify-between glass-card rounded-2xl p-5 transition-all hover:shadow-md hover:border-primary/30">
       <Link to={`/recruiter/candidates/${item.candidate}`} className="absolute inset-0 z-0"aria-label={`View ${item.candidate_name}'s profile`} />

       <div className="relative z-10 pointer-events-none">
        <div className="flex items-start justify-between">
         <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-sm shrink-0">
          <ProfileAvatar name={item.candidate_name} src={item.candidate_avatar} size="lg"className="h-full w-full"/>
         </div>
         <button
          onClick={(e) => { e.preventDefault(); removeShortlist(item.id); }}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0 pointer-events-auto"
          title="Remove from shortlist"
         >
          <Trash2 className="h-4 w-4"/>
         </button>
        </div>

        <div className="mt-3">
         <h3 className="text-base font-bold group-hover:text-primary transition-colors">{item.candidate_name}</h3>
         <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">{item.candidate_headline || 'Professional'}</p>
        </div>

        {item.job_title && (
         <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
          <Bookmark className="h-3 w-3"/> {item.job_title}
         </div>
        )}
       </div>

       <div className="relative z-10 mt-4 pt-4 border-t flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
         <MessageButton recipientId={item.candidate_user_id} name={item.candidate_name} />
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
         <ArrowRight className="h-4 w-4"/>
        </div>
       </div>
      </div>
     ))}
    </div>
   )}

   <ConfirmModal
    isOpen={confirmModal.isOpen}
    onClose={() => setConfirmModal({ isOpen: false, shortlistId: null })}
    onConfirm={handleConfirmRemove}
    title="Remove Candidate"
    message="Are you sure you want to remove this candidate from your saved list?"
    confirmText="Remove"
    isDestructive={true}
   />
  </div>
 )
}
