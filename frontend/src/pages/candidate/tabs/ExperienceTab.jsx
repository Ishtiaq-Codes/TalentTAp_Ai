import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { candidatesAPI } from '@/api/candidates'

export default function ExperienceTab({ profile, refetch, setMessage }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ company_name: '', title: '', start_date: '', end_date: '', is_current: false, description: '' })

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await candidatesAPI.addExperience(form)
      setForm({ company_name: '', title: '', start_date: '', end_date: '', is_current: false, description: '' })
      setShowForm(false)
      refetch(true)
    } catch {
      setMessage('Error adding experience')
    }
  }

  const handleDelete = async (id) => {
    await candidatesAPI.deleteExperience(id)
    refetch(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">Work Experience</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
          <Plus className="h-4 w-4"/> Add Experience
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="rounded-xl border bg-slate-50/50 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Title</label>
              <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</label>
              <input required value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })}
                className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Date</label>
              <input type="date" required value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">End Date</label>
              <input type="date" disabled={form.is_current} value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none disabled:bg-slate-100"/>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="current" checked={form.is_current} onChange={e => setForm({ ...form, is_current: e.target.checked, end_date: '' })} className="rounded border-slate-300"/>
            <label htmlFor="current" className="text-sm font-medium cursor-pointer">I currently work here</label>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
              className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">Save Experience</button>
          </div>
        </form>
      )}

      {profile?.experiences?.length > 0 ? (
        <div className="space-y-3">
          {profile.experiences.map((exp) => (
            <div key={exp.id} className="relative rounded-xl border p-4 hover:shadow-sm transition-shadow group">
              <button onClick={() => handleDelete(exp.id)} className="absolute right-3 top-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                <X className="h-4 w-4"/>
              </button>
              <h3 className="font-bold text-slate-900">{exp.title}</h3>
              <p className="font-medium text-primary text-sm">{exp.company_name}</p>
              <p className="text-xs text-muted-foreground mt-1 mb-2">{exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}</p>
              {exp.description && <p className="text-sm text-slate-600 leading-relaxed">{exp.description}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-2">No experience added yet.</p>
      )}
    </div>
  )
}
