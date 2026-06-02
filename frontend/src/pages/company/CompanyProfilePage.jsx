import { useState } from 'react'
import { useFetch } from '@/hooks/useFetch'
import { companiesAPI } from '@/api/companies'
import SkeletonCard from '@/components/common/SkeletonCard'
import { Save } from 'lucide-react'
import { COMPANY_SIZE } from '@/lib/constants'

export default function CompanyProfilePage() {
  const { data: profile, loading, refetch } = useFetch(() => companiesAPI.getProfile())
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  if (profile && !form) setForm({ ...profile })
  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
  if (!form) return <div className="p-8 text-center text-muted-foreground">Company profile not found. Please create one.</div>

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      if (form.id) {
        await companiesAPI.updateProfile(form)
        setMessage('Company profile updated!')
      } else {
        await companiesAPI.createCompany(form)
        setMessage('Company profile created!')
      }
      refetch()
    } catch (err) {
      console.error(err)
      setMessage(err.response?.data?.detail || 'Error saving profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Company Profile</h1>
          <p className="text-muted-foreground">Manage your company's public information.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && <div className="rounded-lg bg-primary/10 p-3 text-sm text-primary">{message}</div>}

      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Basic Details</h2>
        <div>
          <label className="text-sm font-medium">Company Name</label>
          <input value={form.name || ''} onChange={update('name')}
            className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea value={form.description || ''} onChange={update('description')} rows={4}
            className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Industry</label>
            <input value={form.industry || ''} onChange={update('industry')} placeholder="e.g. Technology"
              className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium">Company Size</label>
            <select value={form.company_size || ''} onChange={update('company_size')}
              className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
              <option value="">Select size...</option>
              {COMPANY_SIZE.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Location & Links</h2>
        <div>
          <label className="text-sm font-medium">Location (City, Country)</label>
          <input value={form.location || ''} onChange={update('location')}
            className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label className="text-sm font-medium">Website URL</label>
          <input value={form.website || ''} onChange={update('website')} placeholder="https://..."
            className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label className="text-sm font-medium">LinkedIn URL</label>
          <input value={form.linkedin_url || ''} onChange={update('linkedin_url')} placeholder="https://linkedin.com/company/..."
            className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
        </div>
      </section>
    </div>
  )
}
