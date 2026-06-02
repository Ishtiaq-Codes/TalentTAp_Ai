import { useState } from 'react'
import { useFetch } from '@/hooks/useFetch'
import { candidatesAPI } from '@/api/candidates'
import { authAPI } from '@/api/auth'
import { useAuth } from '@/contexts/AuthContext'
import SkeletonCard from '@/components/common/SkeletonCard'
import { getImageUrl } from '@/lib/utils'
import { EMPLOYMENT_STATUS, AVAILABILITY, EMPLOYMENT_TYPE } from '@/lib/constants'
import { Save, Plus, X, Upload } from 'lucide-react'

const SelectField = ({ label, field, options, form, update }) => (
  <div>
    <label className="text-sm font-medium">{label}</label>
    <select value={form[field] || ''} onChange={update(field)}
      className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
)

const InputField = ({ label, field, type = 'text', placeholder = '', form, update }) => (
  <div>
    <label className="text-sm font-medium">{label}</label>
    <input type={type} value={form[field] || ''} onChange={update(field)} placeholder={placeholder}
      className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
  </div>
)

export default function ProfilePage() {
  const { user, fetchUser } = useAuth()
  const { data: profile, loading, refetch } = useFetch(() => candidatesAPI.getProfile())
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [message, setMessage] = useState('')
  const [showExpForm, setShowExpForm] = useState(false)
  const [expForm, setExpForm] = useState({ company_name: '', title: '', start_date: '', end_date: '', is_current: false, description: '' })

  // Initialize form when profile loads
  if (profile && !form) setForm({ ...profile })
  
  if (loading && !form) return <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
  if (!form) return null

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const { skills, experiences, user_name, user_email, avatar, resume, ...data } = form
      await candidatesAPI.updateProfile(data)
      setMessage('Profile saved!')
      refetch()
    } catch (err) {
      setMessage('Error saving profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAddSkill = async () => {
    if (!skillInput.trim()) return
    try {
      await candidatesAPI.addSkill({ name: skillInput.trim(), proficiency: 'intermediate' })
      setSkillInput('')
      refetch()
    } catch { /* skill may already exist */ }
  }

  const handleDeleteSkill = async (id) => {
    await candidatesAPI.deleteSkill(id)
    refetch()
  }

  const handleAddExperience = async (e) => {
    e.preventDefault()
    try {
      await candidatesAPI.addExperience(expForm)
      setExpForm({ company_name: '', title: '', start_date: '', end_date: '', is_current: false, description: '' })
      setShowExpForm(false)
      refetch()
    } catch {
      setMessage('Error adding experience')
    }
  }

  const handleDeleteExperience = async (id) => {
    await candidatesAPI.deleteExperience(id)
    refetch()
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      await candidatesAPI.uploadResume(file)
      setMessage('Resume uploaded!')
      refetch()
    } catch {
      setMessage('Error uploading resume')
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      await authAPI.uploadAvatar(file)
      setMessage('Avatar uploaded successfully!')
      refetch()
      await fetchUser()
    } catch {
      setMessage('Error uploading avatar')
    }
  }

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      await candidatesAPI.uploadBanner(file)
      setMessage('Banner uploaded successfully!')
      refetch()
    } catch {
      setMessage('Error uploading banner')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {message && <div className="rounded-lg bg-primary/10 p-3 text-sm text-primary">{message}</div>}

      {/* Images */}
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Profile Images</h2>
        <p className="text-sm text-muted-foreground">Recommended: 1:1 ratio (e.g., 400x400px) for avatars, 3:1 ratio (e.g., 1200x400px) for banners.</p>
        
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Profile Avatar</label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full border bg-slate-100 shrink-0">
                {profile?.avatar ? <img src={getImageUrl(profile.avatar)} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xl font-bold text-primary">{profile?.user_name?.[0] || '?'}</div>}
              </div>
              <label className="cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
                <Upload className="mr-2 inline-block h-4 w-4" /> Upload Avatar
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Profile Banner</label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-32 overflow-hidden rounded-lg border bg-slate-100 shrink-0">
                {profile?.banner_image ? <img src={getImageUrl(profile.banner_image)} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-r from-primary/20 to-blue-500/20" />}
              </div>
              <label className="cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
                <Upload className="mr-2 inline-block h-4 w-4" /> Upload Banner
                <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Basic Info */}
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Basic Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Email (Account)</label>
            <input type="text" disabled value={user?.email || profile?.user_email || ''} className="mt-1 block w-full rounded-lg border bg-slate-100 px-4 py-2.5 text-sm text-slate-500 focus:outline-none" />
          </div>
          <InputField label="Phone" field="phone" form={form} update={update} />
        </div>
        <InputField label="Headline" field="headline" placeholder="e.g. Full-Stack Developer" form={form} update={update} />
        <div>
          <label className="text-sm font-medium">About</label>
          <textarea value={form.about || ''} onChange={update('about')} rows={4}
            className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Country" field="country" form={form} update={update} />
          <InputField label="City" field="city" form={form} update={update} />
        </div>
      </section>

      {/* Professional Info */}
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Professional</h2>
        <InputField label="Years of Experience" field="years_of_experience" type="number" form={form} update={update} />
        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Employment Status" field="employment_status" options={EMPLOYMENT_STATUS} form={form} update={update} />
          <SelectField label="Availability" field="availability" options={AVAILABILITY} form={form} update={update} />
        </div>
        <SelectField label="Preferred Employment Type" field="employment_type_preferred" options={EMPLOYMENT_TYPE} form={form} update={update} />
        <div className="grid grid-cols-3 gap-4">
          <InputField label="Min Salary" field="salary_min" type="number" form={form} update={update} />
          <InputField label="Max Salary" field="salary_max" type="number" form={form} update={update} />
          <InputField label="Currency" field="salary_currency" form={form} update={update} />
        </div>
      </section>

      {/* Skills */}
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {profile?.skills?.map((skill) => (
            <span key={skill.id} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              {skill.name}
              <button onClick={() => handleDeleteSkill(skill.id)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add a skill..."
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
            className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none" />
          <button onClick={handleAddSkill} className="rounded-lg bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Experience */}
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Work Experience</h2>
          <button onClick={() => setShowExpForm(!showExpForm)} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium border hover:bg-slate-50 transition-colors">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        {showExpForm && (
          <form onSubmit={handleAddExperience} className="rounded-lg border bg-slate-50/50 p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Job Title</label>
                <input required value={expForm.title} onChange={e => setExpForm({...expForm, title: e.target.value})} className="mt-1 block w-full rounded-lg border bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium">Company</label>
                <input required value={expForm.company_name} onChange={e => setExpForm({...expForm, company_name: e.target.value})} className="mt-1 block w-full rounded-lg border bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <input type="date" required value={expForm.start_date} onChange={e => setExpForm({...expForm, start_date: e.target.value})} className="mt-1 block w-full rounded-lg border bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <input type="date" disabled={expForm.is_current} value={expForm.end_date} onChange={e => setExpForm({...expForm, end_date: e.target.value})} className="mt-1 block w-full rounded-lg border bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none disabled:bg-slate-100" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="current" checked={expForm.is_current} onChange={e => setExpForm({...expForm, is_current: e.target.checked, end_date: ''})} className="rounded border-slate-300" />
              <label htmlFor="current" className="text-sm font-medium cursor-pointer">I currently work here</label>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})} rows={3} className="mt-1 block w-full rounded-lg border bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowExpForm(false)} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-200">Cancel</button>
              <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">Save Experience</button>
            </div>
          </form>
        )}

        {profile?.experiences?.length > 0 ? (
          <div className="space-y-4">
            {profile.experiences.map((exp) => (
              <div key={exp.id} className="relative rounded-lg border p-4 hover:shadow-sm transition-shadow">
                <button onClick={() => handleDeleteExperience(exp.id)} className="absolute right-4 top-4 text-slate-400 hover:text-red-500">
                  <X className="h-4 w-4" />
                </button>
                <h3 className="font-bold text-slate-900">{exp.title}</h3>
                <p className="font-medium text-primary text-sm">{exp.company_name}</p>
                <p className="text-xs text-muted-foreground mt-1 mb-2">{exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-2">No experience added yet.</p>
        )}
      </section>

      {/* Links */}
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Links</h2>
        <InputField label="LinkedIn" field="linkedin_url" placeholder="https://linkedin.com/in/..." form={form} update={update} />
        <InputField label="GitHub" field="github_url" placeholder="https://github.com/..." form={form} update={update} />
        <InputField label="Portfolio" field="portfolio_url" placeholder="https://..." form={form} update={update} />
      </section>

      {/* Resume */}
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Resume</h2>
        {profile?.resume && <p className="text-sm text-muted-foreground">Current: {profile.resume.split('/').pop()}</p>}
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed p-6 hover:border-primary transition-colors">
          <Upload className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Upload PDF resume</span>
          <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
        </label>
      </section>
    </div>
  )
}
