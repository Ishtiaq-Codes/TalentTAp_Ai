import { useState } from 'react'
import { useFetch } from '@/hooks/useFetch'
import { companiesAPI } from '@/api/companies'
import { Users, UserPlus, Trash2 } from 'lucide-react'

export default function TeamPage() {
  const { data: team, loading, refetch } = useFetch(() => companiesAPI.getRecruiters())
  const [inviting, setInviting] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', title: '' })
  const [showInvite, setShowInvite] = useState(false)

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviting(true)
    try {
      await companiesAPI.inviteRecruiter(form)
      setShowInvite(false)
      setForm({ first_name: '', last_name: '', email: '', title: '' })
      refetch()
    } catch (err) {
      alert(err.response?.data?.email?.[0] || err.response?.data?.detail || 'Error inviting member')
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async (id) => {
    if (confirm('Are you sure you want to remove this member?')) {
      try {
        await companiesAPI.removeRecruiter(id)
        refetch()
      } catch (err) {
        alert('Error removing member')
      }
    }
  }

  const recruiters = Array.isArray(team) ? team : []

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage recruiters and admins for your company.</p>
        </div>
        <button onClick={() => setShowInvite(!showInvite)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <UserPlus className="h-4 w-4" /> Invite Member
        </button>
      </div>

      {showInvite && (
        <form onSubmit={handleInvite} className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Invite New Recruiter</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input required value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} placeholder="First Name" className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none" />
            <input required value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} placeholder="Last Name" className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none" />
            <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email Address" className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none" />
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Job Title (e.g. Senior Recruiter)" className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowInvite(false)} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
            <button type="submit" disabled={inviting} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {inviting ? 'Sending Invite...' : 'Send Invite'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-6 py-3 font-medium text-muted-foreground">Name</th>
              <th className="px-6 py-3 font-medium text-muted-foreground">Title</th>
              <th className="px-6 py-3 font-medium text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan="3" className="px-6 py-4 text-center text-muted-foreground">Loading...</td></tr>
            ) : recruiters.length === 0 ? (
              <tr><td colSpan="3" className="px-6 py-4 text-center text-muted-foreground">No recruiters found.</td></tr>
            ) : (
              recruiters.map(r => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <div className="font-medium">{r.user_name || r.user_email}</div>
                    <div className="text-muted-foreground">{r.user_email}</div>
                  </td>
                  <td className="px-6 py-4">{r.title || 'Recruiter'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleRemove(r.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-md transition-colors" title="Remove member">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
