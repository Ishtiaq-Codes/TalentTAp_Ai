import { useState } from 'react'
import { useFetch } from '@/hooks/useFetch'
import { companiesAPI } from '@/api/companies'
import { Users, UserPlus, Trash2, Mail, ShieldAlert, CheckCircle, ShieldCheck } from 'lucide-react'
import SkeletonCard from '@/components/common/SkeletonCard'
import ConfirmModal from '@/components/common/ConfirmModal'
import { useToast } from '@/contexts/ToastContext'

export default function TeamPage() {
  const { data: team, loading: loadingTeam, refetch: refetchTeam } = useFetch(() => companiesAPI.getRecruiters())
  const { data: pendingData, loading: loadingPending, refetch: refetchPending } = useFetch(() => companiesAPI.getPendingInvites())

  const [inviting, setInviting] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', title: '' })
  const [showInvite, setShowInvite] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const { error } = useToast()
  
  const [confirmRemove, setConfirmRemove] = useState({ isOpen: false, id: null })
  const [confirmRevoke, setConfirmRevoke] = useState({ isOpen: false, id: null })

  const refetchAll = () => {
    refetchTeam()
    refetchPending()
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviting(true)
    try {
      await companiesAPI.inviteRecruiter(form)
      setInviteSuccess(true)
      setForm({ first_name: '', last_name: '', email: '', title: '' })
      refetchAll()
      setTimeout(() => {
        setInviteSuccess(false)
        setShowInvite(false)
      }, 2000)
    } catch (err) {
      error(err.response?.data?.email?.[0] || err.response?.data?.detail || 'Error inviting member')
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = (id) => {
    setConfirmRemove({ isOpen: true, id })
  }

  const handleConfirmRemove = async () => {
    if (confirmRemove.id) {
      try {
        await companiesAPI.removeRecruiter(confirmRemove.id)
        refetchAll()
      } catch (err) {
        error('Error removing member')
      }
    }
  }

  const handleRevoke = (id) => {
    setConfirmRevoke({ isOpen: true, id })
  }

  const handleConfirmRevoke = async () => {
    if (confirmRevoke.id) {
      try {
        await companiesAPI.revokeInvite(confirmRevoke.id)
        refetchAll()
      } catch (err) {
        error('Error revoking invitation')
      }
    }
  }

  const recruiters = Array.isArray(team) ? team : []
  const pendingInvites = Array.isArray(pendingData) ? pendingData : (pendingData?.results || [])

  if (loadingTeam || loadingPending) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            Manage who has access to your company's hiring pipeline. Invite recruiters to help you source and evaluate candidates.
          </p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary/90 transition-all"
        >
          <UserPlus className="h-4 w-4" /> Invite Team Member
        </button>
      </div>

      {/* Invite Form / Slide-down */}
      {showInvite && (
        <div className="animate-fade-in-up rounded-2xl border bg-white p-6 shadow-md overflow-hidden">
          {inviteSuccess ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Invitation Sent!</h3>
              <p className="text-muted-foreground mt-1 text-sm">An email invitation has been sent to their inbox.</p>
            </div>
          ) : (
            <form onSubmit={handleInvite} className="space-y-6">
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Send Invitation</h2>
                  <p className="text-xs text-muted-foreground">They will receive an email to create their recruiter account linked to this company.</p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">First Name</label>
                  <input required value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} placeholder="Jane" className="w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Name</label>
                  <input required value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} placeholder="Doe" className="w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                  <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@yourcompany.com" className="w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Job Title</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Senior Recruiter" className="w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowInvite(false)} className="rounded-full px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" disabled={inviting} className="rounded-full bg-primary px-8 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary/90 disabled:opacity-50 transition-all">
                  {inviting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Team List */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="border-b bg-slate-50/80 px-6 py-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-slate-500" />
          <h3 className="font-semibold text-slate-700">Active Members ({recruiters.length})</h3>
        </div>

        {recruiters.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Users className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-muted-foreground font-medium">You don't have any other team members yet.</p>
          </div>
        ) : (
          <div className="divide-y">
            {recruiters.map(r => (
              <div key={r.id} className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-blue-200 text-lg font-bold text-primary shadow-sm border border-white">
                    {r.user_name ? r.user_name[0].toUpperCase() : r.user_email[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{r.user_name || 'Pending User'}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
                      <span>{r.user_email}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>{r.title || 'Recruiter'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                    <ShieldCheck className="h-3 w-3" /> Active
                  </div>
                  <button
                    onClick={() => handleRemove(r.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Remove member"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="border-b bg-amber-50/80 px-6 py-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-amber-800">Pending Invitations ({pendingInvites.length})</h3>
          </div>

          <div className="divide-y">
            {pendingInvites.map(invite => (
              <div key={invite.id} className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-400 shadow-sm border border-white">
                    {invite.first_name[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{invite.first_name} {invite.last_name}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
                      <span>{invite.email}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>{invite.title || 'Recruiter'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                    Pending Acceptance
                  </div>
                  <button
                    onClick={() => handleRevoke(invite.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Revoke invitation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Notice */}
      <div className="flex items-start gap-3 rounded-2xl bg-blue-50 p-5 text-blue-800 border border-blue-100">
        <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold">Security Note</p>
          <p className="mt-1 opacity-90">All recruiters invited to this company share access to the company's candidate pool, job postings, and shortlists. Do not invite individuals unless you trust them with this access.</p>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={confirmRemove.isOpen}
        onClose={() => setConfirmRemove({ isOpen: false, id: null })}
        onConfirm={handleConfirmRemove}
        title="Remove Member"
        message="Are you sure you want to remove this member from your organization? They will lose access to all jobs and candidates immediately."
        confirmText="Remove"
        isDestructive={true}
      />
      
      <ConfirmModal
        isOpen={confirmRevoke.isOpen}
        onClose={() => setConfirmRevoke({ isOpen: false, id: null })}
        onConfirm={handleConfirmRevoke}
        title="Revoke Invitation"
        message="Are you sure you want to revoke this invitation? The link will be permanently disabled."
        confirmText="Revoke"
        isDestructive={true}
      />
    </div>
  )
}
