import { useState } from 'react'
import { useFetch } from '@/hooks/useFetch'
import { companiesAPI } from '@/api/companies'
import SkeletonCard from '@/components/common/SkeletonCard'
import { Save, Camera } from 'lucide-react'
import { COMPANY_SIZE } from '@/lib/constants'
import { getImageUrl } from '@/lib/utils'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import MessageButton from '@/components/common/MessageButton'

import { useAuth } from '@/contexts/AuthContext'

export default function CompanyProfilePage() {
  const { user: authUser } = useAuth()
  const isCompanyAdmin = authUser?.role === 'company_admin'

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

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      await companiesAPI.uploadImages(file, null)
      setMessage('Logo uploaded successfully!')
      refetch()
    } catch {
      setMessage('Error uploading logo')
    }
  }

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      await companiesAPI.uploadImages(null, file)
      setMessage('Banner uploaded successfully!')
      refetch()
    } catch {
      setMessage('Error uploading banner')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Company Profile</h1>
          <p className="text-muted-foreground">
            {isCompanyAdmin ? "Manage your company's public information." : "View your company's public information."}
          </p>
        </div>
        {isCompanyAdmin && (
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {message && <div className="rounded-lg bg-primary/10 p-3 text-sm text-primary">{message}</div>}

      {/* Header Banner & Logo */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="h-32 bg-slate-100 relative group">
          {profile?.banner_image ? (
            <img src={getImageUrl(profile.banner_image)} alt="Banner" className="h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20" />
          )}
          {isCompanyAdmin && (
            <label className="absolute bottom-2 right-2 cursor-pointer rounded-lg bg-black/50 p-2 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100 backdrop-blur-sm">
              <Camera className="h-4 w-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
            </label>
          )}
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="-mt-12 relative z-10 group flex h-24 w-24 items-center justify-center rounded-xl border-4 border-white bg-white shadow-md overflow-hidden shrink-0">
                <ProfileAvatar name={profile?.name || 'Company'} src={profile?.logo} size="xl" className="h-full w-full rounded-none" />
                {isCompanyAdmin && (
                  <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100 backdrop-blur-sm">
                    <Camera className="h-6 w-6" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                )}
              </div>
              <div className="pb-1">
                <h2 className="text-2xl font-bold">{profile?.name || 'Company Name'}</h2>
                <p className="text-sm text-muted-foreground">{profile?.industry || 'Industry'}</p>
              </div>
            </div>
            {!isCompanyAdmin && profile?.admin_id && profile.admin_id !== authUser?.id && (
              <div className="pb-1 sm:pb-2">
                <MessageButton recipientId={profile.admin_id} name={profile.admin_name || 'Company Admin'} />
              </div>
            )}
          </div>
        </div>
      </div>



      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Basic Details</h2>
        <div>
          <label className="text-sm font-medium">Company Name</label>
          <input value={form.name || ''} onChange={update('name')} disabled={!isCompanyAdmin}
            className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200" />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea value={form.description || ''} onChange={update('description')} rows={4} disabled={!isCompanyAdmin}
            className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Industry</label>
            <input value={form.industry || ''} onChange={update('industry')} placeholder="e.g. Technology" disabled={!isCompanyAdmin}
              className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200" />
          </div>
          <div>
            <label className="text-sm font-medium">Company Size</label>
            <select value={form.company_size || ''} onChange={update('company_size')} disabled={!isCompanyAdmin}
              className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200">
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
          <input value={form.location || ''} onChange={update('location')} disabled={!isCompanyAdmin}
            className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200" />
        </div>
        <div>
          <label className="text-sm font-medium">Website URL</label>
          <input value={form.website || ''} onChange={update('website')} placeholder="https://..." disabled={!isCompanyAdmin}
            className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200" />
        </div>
        <div>
          <label className="text-sm font-medium">LinkedIn URL</label>
          <input value={form.linkedin_url || ''} onChange={update('linkedin_url')} placeholder="https://linkedin.com/company/..." disabled={!isCompanyAdmin}
            className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200" />
        </div>
      </section>
    </div>
  )
}
