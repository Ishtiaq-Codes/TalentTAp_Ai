import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useFetch } from '@/hooks/useFetch'
import { companiesAPI } from '@/api/companies'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import ConfirmModal from '@/components/common/ConfirmModal'
import SkeletonCard from '@/components/common/SkeletonCard'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import { Sparkles, Plus, Users, ChevronRight, ArrowLeft, Trash2, X, Loader2, ExternalLink } from 'lucide-react'

/* ─── Pool Card ─── */
function PoolCard({ pool, onSelect, onDelete, isAdmin }) {
 return (
  <div
   onClick={() => onSelect(pool)}
   className="group relative glass-card rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer hover:border-primary/30"
  >
   <div className="flex items-start justify-between gap-3">
    <div className="flex items-center gap-3">
     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
      <Sparkles className="h-5 w-5"/>
     </div>
     <div>
      <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{pool.name}</h3>
      {pool.description && (
       <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{pool.description}</p>
      )}
     </div>
    </div>
    {isAdmin && (
     <button
      onClick={(e) => { e.stopPropagation(); onDelete(pool) }}
      className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
     >
      <Trash2 className="h-4 w-4"/>
     </button>
    )}
   </div>
   <div className="mt-4 flex items-center justify-between">
    <div className="flex items-center gap-1.5 text-sm text-slate-500">
     <Users className="h-4 w-4"/>
     <span className="font-semibold text-slate-700">{pool.member_count}</span>
     <span>candidates</span>
    </div>
    <div className="flex items-center gap-1 text-xs text-primary font-semibold">
     View <ChevronRight className="h-3.5 w-3.5"/>
    </div>
   </div>
   {pool.created_by_name && (
    <p className="mt-2 text-[11px] text-slate-300">Created by {pool.created_by_name}</p>
   )}
  </div>
 )
}

/* ─── Pool Members View ─── */
function PoolMembersView({ pool, onBack }) {
 const { data: members, loading, refetch } = useFetch(() => companiesAPI.getPoolMembers(pool.id), [pool.id])
 const { success, error } = useToast()
 const [removing, setRemoving] = useState(null)
 const [confirmRemove, setConfirmRemove] = useState(null)

 const handleRemove = async () => {
  if (!confirmRemove) return
  setRemoving(confirmRemove.candidate_id)
  try {
   await companiesAPI.removePoolMember(pool.id, confirmRemove.candidate_id)
   success('Candidate removed from pool.')
   refetch(true)
  } catch {
   error('Failed to remove candidate.')
  } finally {
   setRemoving(null)
   setConfirmRemove(null)
  }
 }

 const memberList = Array.isArray(members) ? members : []

 return (
  <div className="space-y-6 animate-fade-in">
   <div className="flex items-center gap-4">
    <button
     onClick={onBack}
     className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
    >
     <ArrowLeft className="h-4 w-4"/> Back to Pools
    </button>
   </div>

   <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
     <Sparkles className="h-5 w-5"/>
    </div>
    <div>
     <h2 className="text-xl font-bold text-slate-900">{pool.name}</h2>
     {pool.description && <p className="text-sm text-slate-400">{pool.description}</p>}
    </div>
   </div>

   <div className="glass-card rounded-2xl overflow-hidden">
    <div className="flex items-center gap-2 border-b px-6 py-4 bg-slate-50/60">
     <Users className="h-4 w-4 text-slate-400"/>
     <h3 className="font-semibold text-slate-700">Candidates ({memberList.length})</h3>
    </div>

    {loading ? (
     <div className="p-6 space-y-4">
      {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
     </div>
    ) : memberList.length === 0 ? (
     <div className="flex flex-col items-center justify-center py-12 text-center">
      <Users className="h-10 w-10 text-slate-200 mb-3"/>
      <p className="text-sm text-slate-400">No candidates in this pool yet.</p>
      <p className="text-xs text-slate-300 mt-1">Add candidates from their profile page or Search Candidates.</p>
     </div>
    ) : (
     <div className="divide-y">
      {memberList.map(member => (
       <div key={member.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
        <ProfileAvatar
         name={member.candidate_name}
         src={member.candidate_avatar}
         size="md"
        />
        <div className="flex-1 min-w-0">
         <p className="font-semibold text-slate-900 truncate">{member.candidate_name}</p>
         <p className="text-sm text-slate-400 truncate">
          {member.candidate_headline || 'Professional'}
          {member.candidate_city && ` · ${member.candidate_city}`}
          {member.candidate_country && `, ${member.candidate_country}`}
         </p>
         {member.notes && (
          <p className="mt-1.5 text-sm italic text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-2">"{member.notes}"</p>
         )}
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
         <div className="flex items-center gap-2">
          <Link
           to={`/recruiter/candidates/${member.candidate_id}`}
           className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
          >
           View Profile
          </Link>
          <button
           onClick={() => setConfirmRemove({ candidate_id: member.candidate_id, name: member.candidate_name })}
           disabled={removing === member.candidate_id}
           className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
           title="Remove from Pool"
          >
           {removing === member.candidate_id
            ? <Loader2 className="h-4 w-4 animate-spin"/>
            : <X className="h-4 w-4"/>
           }
          </button>
         </div>
         <p className="text-[10px] text-slate-300 hidden sm:block">
          Added by {member.added_by_name} · {new Date(member.added_at).toLocaleDateString()}
         </p>
        </div>
       </div>
      ))}
     </div>
    )}
   </div>

   <ConfirmModal
    isOpen={!!confirmRemove}
    onClose={() => setConfirmRemove(null)}
    onConfirm={handleRemove}
    title="Remove from Pool"
    message={`Remove ${confirmRemove?.name} from this talent pool?`}
    confirmText="Remove"
    isDestructive={true}
   />
  </div>
 )
}

/* ─── Create Pool Modal ─── */
function CreatePoolModal({ onClose, onCreated }) {
 const [form, setForm] = useState({ name: '', description: '' })
 const [loading, setLoading] = useState(false)
 const { success, error } = useToast()

 const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  try {
   const res = await companiesAPI.createPool(form)
   success(`"${res.data.name}"pool created!`)
   onCreated(res.data)
  } catch (err) {
   error(err.response?.data?.name?.[0] || 'Failed to create pool.')
  } finally {
   setLoading(false)
  }
 }

 return createPortal(
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
   <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl animate-scale-in overflow-hidden">
    <div className="border-b px-6 py-5">
     <h2 className="text-lg font-bold text-slate-900">Create Talent Pool</h2>
     <p className="text-sm text-slate-400 mt-1">Organise candidates into a curated group.</p>
    </div>
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
     <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pool Name *</label>
      <input
       required
       value={form.name}
       onChange={e => setForm({ ...form, name: e.target.value })}
       placeholder="e.g. Python Developers, Senior Engineers"
       className="mt-2 w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      />
     </div>
     <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</label>
      <textarea
       value={form.description}
       onChange={e => setForm({ ...form, description: e.target.value })}
       placeholder="Optional: describe what this pool is for"
       rows={3}
       className="mt-2 w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
      />
     </div>
     <div className="flex justify-end gap-3 pt-2">
      <button type="button"onClick={onClose} className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
       Cancel
      </button>
      <button
       type="submit"
       disabled={loading}
       className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-all"
      >
       {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Plus className="h-4 w-4"/>}
       Create Pool
      </button>
     </div>
    </form>
   </div>
  </div>,
  document.body
 )
}

/* ─── Main Talent Pools Page ─── */
export default function TalentPoolsPage() {
 const { user } = useAuth()
 const { data: pools, loading, refetch } = useFetch(() => companiesAPI.getPools())
 const { error } = useToast()
 const [selectedPool, setSelectedPool] = useState(null)
 const [showCreate, setShowCreate] = useState(false)
 const [confirmDelete, setConfirmDelete] = useState(null)
 const [deleting, setDeleting] = useState(false)

 const isAdmin = user?.role === 'company_admin' || user?.role === 'admin'
 const poolList = Array.isArray(pools) ? pools : []

 const handlePoolCreated = (pool) => {
  setShowCreate(false)
  refetch(true)
  setSelectedPool(pool)
 }

 const handleDeletePool = async () => {
  if (!confirmDelete) return
  setDeleting(true)
  try {
   await companiesAPI.deletePool(confirmDelete.id)
   refetch(true)
   if (selectedPool?.id === confirmDelete.id) setSelectedPool(null)
  } catch {
   error('Failed to delete pool.')
  } finally {
   setDeleting(false)
   setConfirmDelete(null)
  }
 }

 if (selectedPool) {
  return (
   <div className="max-w-4xl mx-auto">
    <PoolMembersView
     pool={selectedPool}
     onBack={() => { setSelectedPool(null); refetch(true) }}
    />
   </div>
  )
 }

 return (
  <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
   {/* Header */}
   <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
    <div>
     <h1 className="text-3xl font-bold tracking-tight">Talent Pools</h1>
     <p className="mt-2 text-muted-foreground max-w-xl">
      Organise your best candidates into curated pools for faster, smarter hiring decisions.
     </p>
    </div>
    <button
     onClick={() => setShowCreate(true)}
     className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary/90 transition-all"
    >
     <Plus className="h-4 w-4"/> New Pool
    </button>
   </div>

   {/* Pool Grid */}
   {loading ? (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
     {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
   ) : poolList.length === 0 ? (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-white py-20 text-center">
     <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-400 mb-4">
      <Sparkles className="h-8 w-8"/>
     </div>
     <h3 className="text-lg font-bold text-slate-700">No Talent Pools Yet</h3>
     <p className="mt-2 text-sm text-slate-400 max-w-sm">
      Create your first pool to start organising candidates — like"Python Developers"or"Remote AI Engineers".
     </p>
     <button
      onClick={() => setShowCreate(true)}
      className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-all"
     >
      <Plus className="h-4 w-4"/> Create First Pool
     </button>
    </div>
   ) : (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
     {poolList.map(pool => (
      <PoolCard
       key={pool.id}
       pool={pool}
       onSelect={setSelectedPool}
       onDelete={setConfirmDelete}
       isAdmin={isAdmin}
      />
     ))}
    </div>
   )}

   {/* Modals */}
   {showCreate && (
    <CreatePoolModal onClose={() => setShowCreate(false)} onCreated={handlePoolCreated} />
   )}

   <ConfirmModal
    isOpen={!!confirmDelete}
    onClose={() => setConfirmDelete(null)}
    onConfirm={handleDeletePool}
    title="Delete Talent Pool"
    message={`Delete"${confirmDelete?.name}"? All ${confirmDelete?.member_count || 0} member records will be removed. This cannot be undone.`}
    confirmText="Delete Pool"
    isDestructive={true}
   />
  </div>
 )
}
