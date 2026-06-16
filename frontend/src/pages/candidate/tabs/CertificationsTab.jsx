import { useState } from 'react'
import { Plus, X, Globe } from 'lucide-react'
import { candidatesAPI } from '@/api/candidates'

export default function CertificationsTab({ profile, refetch, setMessage }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', issuing_organization: '', issue_date: '', expiration_date: '', credential_id: '', credential_url: '' })

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await candidatesAPI.addCertification(form)
      setForm({ name: '', issuing_organization: '', issue_date: '', expiration_date: '', credential_id: '', credential_url: '' })
      setShowForm(false)
      refetch(true)
    } catch {
      setMessage('Error adding certification')
    }
  }

  const handleDelete = async (id) => {
    await candidatesAPI.deleteCertification(id)
    refetch(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">Certifications</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
          <Plus className="h-4 w-4"/> Add Certification
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="rounded-xl border bg-slate-50/50 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Certification Name</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Issuing Organization</label>
              <input required value={form.issuing_organization} onChange={e => setForm({ ...form, issuing_organization: e.target.value })}
                className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Issue Date</label>
              <input type="date" value={form.issue_date} onChange={e => setForm({ ...form, issue_date: e.target.value })}
                className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiration Date</label>
              <input type="date" value={form.expiration_date} onChange={e => setForm({ ...form, expiration_date: e.target.value })}
                className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Credential ID</label>
              <input value={form.credential_id} onChange={e => setForm({ ...form, credential_id: e.target.value })}
                className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Credential URL</label>
              <input type="url" value={form.credential_url} onChange={e => setForm({ ...form, credential_url: e.target.value })}
                className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">Save Certification</button>
          </div>
        </form>
      )}

      {profile?.certifications?.length > 0 ? (
        <div className="space-y-3">
          {profile.certifications.map((cert) => (
            <div key={cert.id} className="relative rounded-xl border p-4 hover:shadow-sm transition-shadow group">
              <button onClick={() => handleDelete(cert.id)} className="absolute right-3 top-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                <X className="h-4 w-4"/>
              </button>
              <h3 className="font-bold text-slate-900">{cert.name}</h3>
              <p className="font-medium text-primary text-sm">{cert.issuing_organization}</p>
              {cert.issue_date && (
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Issued {cert.issue_date} {cert.expiration_date ? `· Expires ${cert.expiration_date}` : ''}
                </p>
              )}
              {(cert.credential_id || cert.credential_url) && (
                <div className="mt-2 flex flex-wrap gap-3 text-sm">
                  {cert.credential_id && <span className="text-slate-600 font-mono">ID: {cert.credential_id}</span>}
                  {cert.credential_url && (
                    <a href={cert.credential_url} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      Verify Credential <Globe className="h-3 w-3"/>
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-2">No certifications added yet.</p>
      )}
    </div>
  )
}
