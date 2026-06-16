import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { candidatesAPI } from '@/api/candidates'

export default function EducationTab({ profile, refetch, setMessage }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ institution_name: '', degree: '', field_of_study: '', start_date: '', end_date: '', description: '' })

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await candidatesAPI.addEducation(form)
      setForm({ institution_name: '', degree: '', field_of_study: '', start_date: '', end_date: '', description: '' })
      setShowForm(false)
      refetch(true)
    } catch {
      setMessage('Error adding education')
    }
  }

  const handleDelete = async (id) => {
    await candidatesAPI.deleteEducation(id)
    refetch(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">Education</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
          <Plus className="h-4 w-4"/> Add Education
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="rounded-xl border bg-slate-50/50 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Institution Name</label>
              <input required value={form.institution_name} onChange={e => setForm({ ...form, institution_name: e.target.value })}
                className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Degree</label>
              <input required value={form.degree} onChange={e => setForm({ ...form, degree: e.target.value })}
                className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Field of Study</label>
            <input value={form.field_of_study} onChange={e => setForm({ ...form, field_of_study: e.target.value })}
              className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Date</label>
              <input type="date" required value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">End Date (or expected)</label>
              <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
              className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">Save Education</button>
          </div>
        </form>
      )}

      {profile?.education?.length > 0 ? (
        <div className="space-y-3">
          {profile.education.map((edu) => (
            <div key={edu.id} className="relative rounded-xl border p-4 hover:shadow-sm transition-shadow group">
              <button onClick={() => handleDelete(edu.id)} className="absolute right-3 top-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                <X className="h-4 w-4"/>
              </button>
              <h3 className="font-bold text-slate-900">{edu.degree}</h3>
              <p className="font-medium text-primary text-sm">{edu.institution_name}</p>
              <p className="text-xs text-muted-foreground mt-1 mb-2">{edu.start_date} - {edu.end_date || 'Present'}</p>
              {edu.field_of_study && <p className="text-sm font-medium text-slate-700 mb-1">Field of Study: {edu.field_of_study}</p>}
              {edu.description && <p className="text-sm text-slate-600 leading-relaxed">{edu.description}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-2">No education added yet.</p>
      )}
    </div>
  )
}
