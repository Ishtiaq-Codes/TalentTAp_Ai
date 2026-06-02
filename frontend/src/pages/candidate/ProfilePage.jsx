import { useState } from 'react'
import { useFetch } from '@/hooks/useFetch'
import { candidatesAPI } from '@/api/candidates'
import { useAuth } from '@/contexts/AuthContext'
import SkeletonCard from '@/components/common/SkeletonCard'
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
  const { user } = useAuth()
  const { data: profile, loading, refetch } = useFetch(() => candidatesAPI.getProfile())
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [message, setMessage] = useState('')

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

      {/* Basic Info */}
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Basic Information</h2>
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
        <InputField label="Phone" field="phone" form={form} update={update} />
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
