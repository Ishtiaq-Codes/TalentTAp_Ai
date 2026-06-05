import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFetch } from '@/hooks/useFetch'
import { applicationsAPI } from '@/api/applications'
import EmptyState from '@/components/common/EmptyState'
import SkeletonCard from '@/components/common/SkeletonCard'
import { formatDate } from '@/lib/utils'
import { FileText, Pencil, Trash2, Loader2, Save, X } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

const STATUS_COLORS = {
  applied: 'bg-blue-100 text-blue-700',
  reviewing: 'bg-purple-100 text-purple-700',
  shortlisted: 'bg-amber-100 text-amber-700',
  interview: 'bg-cyan-100 text-cyan-700',
  offered: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-700',
}

export default function ApplicationsPage() {
  const { data: applications, loading, refetch } = useFetch(() => applicationsAPI.list())
  const { success, error } = useToast()
  
  const [editingApp, setEditingApp] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>

  const appList = Array.isArray(applications) ? applications : []

  const handleEdit = (app) => {
    setEditingApp(app)
    setCoverLetter(app.cover_letter || '')
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      await applicationsAPI.update(editingApp.id, { cover_letter: coverLetter })
      success('Application updated successfully')
      setEditingApp(null)
      refetch()
    } catch (err) {
      error('Failed to update application')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw and delete this application?')) return
    setDeletingId(id)
    try {
      await applicationsAPI.delete(id)
      success('Application withdrawn successfully')
      refetch()
    } catch (err) {
      error('Failed to withdraw application')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">My Applications</h1>

      {appList.length === 0 ? (
        <EmptyState icon={FileText} title="No applications yet" description="Start browsing jobs and apply to positions that match your skills." />
      ) : (
        <div className="space-y-4">
          {appList.map((app) => (
            <div key={app.id} className="rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30 group">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    <Link to={`/candidate/jobs/${app.job}`} className="hover:underline">
                      {app.job_title || 'Job'}
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{app.company_name}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-700'}`}>
                    {app.status?.replace('_', ' ')}
                  </span>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(app)}
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Edit Application"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(app.id)}
                      disabled={deletingId === app.id}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Withdraw Application"
                    >
                      {deletingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-500 bg-slate-50 p-2.5 rounded-lg border">
                <span>Applied: {formatDate(app.created_at)}</span>
                {app.updated_at !== app.created_at && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>Updated: {formatDate(app.updated_at)}</span>
                  </>
                )}
                {app.cover_letter && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span className="text-primary flex items-center gap-1"><FileText className="h-3 w-3" /> Cover Letter</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="text-lg font-bold">Edit Application</h2>
              <button 
                onClick={() => setEditingApp(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-1">Job Role</p>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border">{editingApp.job_title} at {editingApp.company_name}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-900 mb-1 block">Cover Letter / Note</label>
                <textarea 
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  className="w-full h-32 rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Why are you a great fit for this role?..."
                />
              </div>
            </div>
            <div className="border-t p-5 bg-slate-50/50 flex justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={() => setEditingApp(null)}
                className="rounded-full px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
