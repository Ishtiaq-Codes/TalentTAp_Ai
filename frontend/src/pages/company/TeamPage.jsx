import { useState } from 'react'
import { useFetch } from '@/hooks/useFetch'
import { companiesAPI } from '@/api/companies'
import { useAuth } from '@/contexts/AuthContext'
import { Users, UserPlus, Trash2, Mail, ShieldAlert, CheckCircle, ShieldCheck, ShieldX, Briefcase, Heart, MessageSquare, MoreVertical } from 'lucide-react'
import SkeletonCard from '@/components/common/SkeletonCard'
import ConfirmModal from '@/components/common/ConfirmModal'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import { useToast } from '@/contexts/ToastContext'

/* ─── Recruiter Card ─── */
function RecruiterCard({ recruiter, onRemove, onToggleStatus, isSelf }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className={`flex items-center gap-4 p-5 hover:bg-slate-50/50 transition-colors relative ${!recruiter.is_active ? 'opacity-60' : ''}`}>
      <div className="relative shrink-0">
        <ProfileAvatar name={recruiter.user_name} src={recruiter.avatar} size="lg" />
        <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${recruiter.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-slate-900 truncate">{recruiter.user_name || 'Team Member'}</h4>
          {isSelf && (
            <span className="shrink-0 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">You</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">{recruiter.user_email}</p>
        <p className="text-xs text-slate-400 mt-0.5">{recruiter.title || 'Recruiter'}</p>
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-5 shrink-0">
        <div className="text-center">
          <p className="text-sm font-bold text-slate-900">{recruiter.jobs_count ?? 0}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide flex items-center gap-1"><Briefcase className="h-2.5 w-2.5" /> Jobs</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-900">{recruiter.shortlists_count ?? 0}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide flex items-center gap-1"><Heart className="h-2.5 w-2.5" /> Saved</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-900">{recruiter.messages_count ?? 0}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide flex items-center gap-1"><MessageSquare className="h-2.5 w-2.5" /> Msgs</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className={`shrink-0 hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${
        recruiter.is_active
          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
          : 'bg-slate-100 text-slate-500 border-slate-200'
      }`}>
        {recruiter.is_active
          ? <><ShieldCheck className="h-3 w-3" /> Active</>
          : <><ShieldX className="h-3 w-3" /> Suspended</>
        }
      </div>

      {/* Actions */}
      {!isSelf && (
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-9 z-20 w-44 rounded-xl border bg-white shadow-xl py-1 animate-fade-in-up">
                <button
                  onClick={() => { onToggleStatus(recruiter); setMenuOpen(false) }}
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium ${
                    recruiter.is_active
                      ? 'text-amber-600 hover:bg-amber-50'
                      : 'text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  {recruiter.is_active ? <ShieldX className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  {recruiter.is_active ? 'Suspend' : 'Reactivate'}
                </button>
                <div className="border-t my-1" />
                <button
                  onClick={() => { onRemove(recruiter); setMenuOpen(false) }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" /> Remove
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function TeamPage() {
  const { user: currentUser } = useAuth()
  const { data: team, loading: loadingTeam, refetch: refetchTeam } = useFetch(() => companiesAPI.getRecruiters())
  const { data: pendingData, loading: loadingPending, refetch: refetchPending } = useFetch(() => companiesAPI.getPendingInvites())

  const [inviting, setInviting] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', title: '' })
  const [showInvite, setShowInvite] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const { success, error } = useToast()

  const [confirmRemove, setConfirmRemove] = useState({ isOpen: false, recruiter: null })
  const [confirmRevoke, setConfirmRevoke] = useState({ isOpen: false, id: null })
  const [confirmStatus, setConfirmStatus] = useState({ isOpen: false, recruiter: null })

  const refetchAll = () => { refetchTeam(); refetchPending() }

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviting(true)
    try {
      await companiesAPI.inviteRecruiter(form)
      setInviteSuccess(true)
      setForm({ first_name: '', last_name: '', email: '', title: '' })
      refetchAll()
      setTimeout(() => { setInviteSuccess(false); setShowInvite(false) }, 2000)
    } catch (err) {
      error(err.response?.data?.email?.[0] || err.response?.data?.detail || 'Error inviting member')
    } finally {
      setInviting(false)
    }
  }

  const handleConfirmRemove = async () => {
    if (!confirmRemove.recruiter) return
    try {
      await companiesAPI.removeRecruiter(confirmRemove.recruiter.id)
      success(`${confirmRemove.recruiter.user_name} removed.`)
      refetchAll()
    } catch {
      error('Error removing member')
    }
  }

  const handleConfirmRevoke = async () => {
    if (!confirmRevoke.id) return
    try {
      await companiesAPI.revokeInvite(confirmRevoke.id)
      refetchAll()
    } catch {
      error('Error revoking invitation')
    }
  }

  const handleConfirmStatus = async () => {
    if (!confirmStatus.recruiter) return
    const recruiter = confirmStatus.recruiter
    try {
      await companiesAPI.updateRecruiterStatus(recruiter.id, !recruiter.is_active)
      success(`${recruiter.user_name} ${recruiter.is_active ? 'suspended' : 'reactivated'}.`)
      refetchAll()
    } catch {
      error('Failed to update recruiter status.')
    }
  }

  const recruiters = Array.isArray(team) ? team : []
  const pendingInvites = Array.isArray(pendingData) ? pendingData : (pendingData?.results || [])
  const activeCount = recruiters.filter(r => r.is_active).length

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
            Manage your hiring team. Invite, suspend, or remove recruiters and monitor their activity.
          </p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary/90 transition-all"
        >
          <UserPlus className="h-4 w-4" /> Invite Team Member
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Members', value: recruiters.length },
          { label: 'Active', value: activeCount },
          { label: 'Pending Invites', value: pendingInvites.length },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Invite Form */}
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
          <h3 className="font-semibold text-slate-700">Team Members ({recruiters.length})</h3>
        </div>

        {recruiters.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Users className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-muted-foreground font-medium">No team members yet. Invite your first recruiter.</p>
          </div>
        ) : (
          <div className="divide-y">
            {recruiters.map(r => (
              <RecruiterCard
                key={r.id}
                recruiter={r}
                isSelf={r.user_email === currentUser?.email}
                onRemove={(recruiter) => setConfirmRemove({ isOpen: true, recruiter })}
                onToggleStatus={(recruiter) => setConfirmStatus({ isOpen: true, recruiter })}
              />
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
              <div key={invite.id} className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-400">
                    {invite.first_name[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{invite.first_name} {invite.last_name}</h4>
                    <p className="text-sm text-muted-foreground">{invite.email} · {invite.title || 'Recruiter'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    Pending
                  </span>
                  <button
                    onClick={() => setConfirmRevoke({ isOpen: true, id: invite.id })}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
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

      {/* Security Notice */}
      <div className="flex items-start gap-3 rounded-2xl bg-blue-50 p-5 text-blue-800 border border-blue-100">
        <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold">Access Controls</p>
          <p className="mt-1 opacity-90">Suspended recruiters immediately lose access to all jobs and candidate data. Use suspension for temporary leave and removal for permanent offboarding.</p>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={confirmRemove.isOpen}
        onClose={() => setConfirmRemove({ isOpen: false, recruiter: null })}
        onConfirm={handleConfirmRemove}
        title="Remove Member"
        message={`Remove ${confirmRemove.recruiter?.user_name} from your organization? They will lose access to all jobs and candidates immediately.`}
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

      <ConfirmModal
        isOpen={confirmStatus.isOpen}
        onClose={() => setConfirmStatus({ isOpen: false, recruiter: null })}
        onConfirm={handleConfirmStatus}
        title={confirmStatus.recruiter?.is_active ? 'Suspend Recruiter' : 'Reactivate Recruiter'}
        message={
          confirmStatus.recruiter?.is_active
            ? `Suspend ${confirmStatus.recruiter?.user_name}? They will immediately lose access to all hiring features.`
            : `Reactivate ${confirmStatus.recruiter?.user_name}? They will regain full access to the hiring platform.`
        }
        confirmText={confirmStatus.recruiter?.is_active ? 'Suspend' : 'Reactivate'}
        isDestructive={!!confirmStatus.recruiter?.is_active}
      />
    </div>
  )
}
