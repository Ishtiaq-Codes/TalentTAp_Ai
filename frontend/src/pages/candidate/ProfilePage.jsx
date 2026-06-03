import { useState } from 'react'
import { useFetch } from '@/hooks/useFetch'
import { candidatesAPI } from '@/api/candidates'
import { authAPI } from '@/api/auth'
import { useAuth } from '@/contexts/AuthContext'
import SkeletonCard from '@/components/common/SkeletonCard'
import { getImageUrl } from '@/lib/utils'
import { EMPLOYMENT_STATUS, AVAILABILITY, EMPLOYMENT_TYPE } from '@/lib/constants'
import {
  Save, Plus, X, Upload, User, Briefcase, Code, FileText, Globe,
  Camera, CheckCircle, AlertCircle, ArrowRight, Sparkles,
} from 'lucide-react'

/* ─── Reusable fields ─── */
const SelectField = ({ label, field, options, form, update }) => (
  <div>
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
    <select value={form[field] || ''} onChange={update(field)}
      className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
)

const InputField = ({ label, field, type = 'text', placeholder = '', form, update }) => (
  <div>
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
    <input type={type} value={form[field] || ''} onChange={update(field)} placeholder={placeholder}
      className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all" />
  </div>
)

/* ─── Profile Strength Tier ─── */
function ProfileStrengthBanner({ completion, suggestions }) {
  const tiers = [
    { min: 0, label: 'Starter Profile', color: 'text-red-700', bg: 'from-red-50 to-orange-50', border: 'border-red-200', bar: 'bg-red-500', icon: '🚀' },
    { min: 31, label: 'Growing Profile', color: 'text-amber-700', bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200', bar: 'bg-amber-500', icon: '📈' },
    { min: 61, label: 'Strong Profile', color: 'text-blue-700', bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200', bar: 'bg-blue-500', icon: '💪' },
    { min: 81, label: 'Outstanding Profile', color: 'text-emerald-700', bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-200', bar: 'bg-emerald-500', icon: '⭐' },
  ]
  const tier = [...tiers].reverse().find(t => completion >= t.min) || tiers[0]

  return (
    <div className={`rounded-xl border ${tier.border} bg-gradient-to-r ${tier.bg} p-5`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{tier.icon}</span>
          <span className={`text-sm font-bold ${tier.color}`}>{tier.label}</span>
        </div>
        <span className={`text-2xl font-bold ${tier.color}`}>{completion}%</span>
      </div>
      <div className="h-2 bg-white/60 rounded-full overflow-hidden mb-3">
        <div className={`h-full rounded-full transition-all duration-1000 ${tier.bar}`} style={{ width: `${completion}%` }} />
      </div>
      {suggestions.length > 0 && (
        <div className="space-y-1.5">
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
              <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" />
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Tab navigation ─── */
const TABS = [
  { id: 'basic', label: 'Basic Info', icon: User },
  { id: 'professional', label: 'Professional', icon: Briefcase },
  { id: 'skills', label: 'Skills', icon: Code },
  { id: 'experience', label: 'Experience', icon: FileText },
  { id: 'links', label: 'Links & Resume', icon: Globe },
]

export default function ProfilePage() {
  const { user, fetchUser } = useAuth()
  const { data: profile, loading, refetch } = useFetch(() => candidatesAPI.getProfile())
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [skillProficiency, setSkillProficiency] = useState('intermediate')
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('basic')
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
      await candidatesAPI.addSkill({ name: skillInput.trim(), proficiency: skillProficiency })
      setSkillInput('')
      setSkillProficiency('intermediate')
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

  // Profile suggestions
  const suggestions = []
  if (!profile?.headline) suggestions.push('Add a professional headline')
  if (!profile?.about) suggestions.push('Write a professional summary')
  if ((profile?.skills?.length || 0) < 3) suggestions.push(`Add ${3 - (profile?.skills?.length || 0)} more skill${3 - (profile?.skills?.length || 0) > 1 ? 's' : ''}`)
  if (!profile?.experiences?.length) suggestions.push('Add your work experience')
  if (!profile?.resume) suggestions.push('Upload your resume')
  if (!profile?.city) suggestions.push('Add your location')

  const completion = profile?.profile_completion || 0

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8 animate-fade-in">
      {/* ─── Live Preview Header ─── */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="h-36 bg-slate-100 relative group">
          {profile?.banner_image ? (
            <img src={getImageUrl(profile.banner_image)} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800" />
          )}
          <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all cursor-pointer">
            <span className="hidden group-hover:flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-lg">
              <Camera className="h-4 w-4" /> Change Banner
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
          </label>
        </div>

        <div className="px-6 pb-5">
          <div className="flex items-end gap-4">
            <div className="-mt-10 relative group shrink-0">
              <div className="h-20 w-20 overflow-hidden rounded-xl border-4 border-white bg-white shadow-md">
                {profile?.avatar ? (
                  <img src={getImageUrl(profile.avatar)} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-2xl font-bold text-primary">{profile?.user_name?.[0] || '?'}</div>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 group-hover:bg-black/40 transition-all cursor-pointer">
                <Camera className="h-5 w-5 text-white hidden group-hover:block" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
              <div>
                <h1 className="text-xl font-bold text-slate-900">{profile?.user_name || 'Your Name'}</h1>
                <p className="text-sm text-muted-foreground">{form.headline || 'Add a professional headline'}</p>
              </div>
              <button onClick={handleSave} disabled={saving}
                className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-all">
                <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`rounded-lg p-3 text-sm font-medium flex items-center gap-2 ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {message.includes('Error') ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          {message}
        </div>
      )}

      {/* ─── Profile Strength ─── */}
      <ProfileStrengthBanner completion={completion} suggestions={suggestions} />

      {/* ─── Tab Navigation ─── */}
      <div className="flex gap-1 rounded-xl border bg-white p-1 shadow-sm overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* ─── Tab Content ─── */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-slate-900">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email (Account)</label>
                <input type="text" disabled value={user?.email || profile?.user_email || ''}
                  className="mt-1.5 block w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-sm text-slate-400" />
              </div>
              <InputField label="Phone" field="phone" form={form} update={update} />
            </div>
            <InputField label="Headline" field="headline" placeholder="e.g. Full-Stack Developer" form={form} update={update} />
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">About</label>
              <textarea value={form.about || ''} onChange={update('about')} rows={4} placeholder="Write a professional summary..."
                className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Country" field="country" form={form} update={update} />
              <InputField label="City" field="city" form={form} update={update} />
            </div>
          </div>
        )}

        {/* Professional Tab */}
        {activeTab === 'professional' && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-slate-900">Professional Details</h2>
            <InputField label="Years of Experience" field="years_of_experience" type="number" form={form} update={update} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField label="Employment Status" field="employment_status" options={EMPLOYMENT_STATUS} form={form} update={update} />
              <SelectField label="Availability" field="availability" options={AVAILABILITY} form={form} update={update} />
            </div>
            <SelectField label="Preferred Employment Type" field="employment_type_preferred" options={EMPLOYMENT_TYPE} form={form} update={update} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField label="Min Salary" field="salary_min" type="number" form={form} update={update} />
              <InputField label="Max Salary" field="salary_max" type="number" form={form} update={update} />
              <InputField label="Currency" field="salary_currency" form={form} update={update} />
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-slate-900">Skills & Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {profile?.skills?.map((skill) => (
                <span key={skill.id} className="inline-flex items-center gap-2 rounded-lg bg-slate-50 border px-3 py-2 text-sm group hover:border-red-200 transition-colors">
                  <span className="font-medium text-slate-700">{skill.name}</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">{skill.proficiency}</span>
                  <button onClick={() => handleDeleteSkill(skill.id)} className="text-slate-300 group-hover:text-red-500 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add a skill..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                className="flex-1 rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all" />
              <select value={skillProficiency} onChange={(e) => setSkillProficiency(e.target.value)}
                className="rounded-lg border bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none capitalize">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              <button onClick={handleAddSkill} className="rounded-lg bg-primary px-4 py-2.5 text-white hover:bg-primary/90 transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Experience Tab */}
        {activeTab === 'experience' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Work Experience</h2>
              <button onClick={() => setShowExpForm(!showExpForm)}
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
                <Plus className="h-4 w-4" /> Add Experience
              </button>
            </div>

            {showExpForm && (
              <form onSubmit={handleAddExperience} className="rounded-xl border bg-slate-50/50 p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Title</label>
                    <input required value={expForm.title} onChange={e => setExpForm({ ...expForm, title: e.target.value })}
                      className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</label>
                    <input required value={expForm.company_name} onChange={e => setExpForm({ ...expForm, company_name: e.target.value })}
                      className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Date</label>
                    <input type="date" required value={expForm.start_date} onChange={e => setExpForm({ ...expForm, start_date: e.target.value })}
                      className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">End Date</label>
                    <input type="date" disabled={expForm.is_current} value={expForm.end_date} onChange={e => setExpForm({ ...expForm, end_date: e.target.value })}
                      className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none disabled:bg-slate-100" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="current" checked={expForm.is_current} onChange={e => setExpForm({ ...expForm, is_current: e.target.checked, end_date: '' })} className="rounded border-slate-300" />
                  <label htmlFor="current" className="text-sm font-medium cursor-pointer">I currently work here</label>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                  <textarea value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} rows={3}
                    className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowExpForm(false)} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
                  <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">Save Experience</button>
                </div>
              </form>
            )}

            {profile?.experiences?.length > 0 ? (
              <div className="space-y-3">
                {profile.experiences.map((exp) => (
                  <div key={exp.id} className="relative rounded-xl border p-4 hover:shadow-sm transition-shadow group">
                    <button onClick={() => handleDeleteExperience(exp.id)} className="absolute right-3 top-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <X className="h-4 w-4" />
                    </button>
                    <h3 className="font-bold text-slate-900">{exp.title}</h3>
                    <p className="font-medium text-primary text-sm">{exp.company_name}</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-2">{exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}</p>
                    {exp.description && <p className="text-sm text-slate-600 leading-relaxed">{exp.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-2">No experience added yet.</p>
            )}
          </div>
        )}

        {/* Links & Resume Tab */}
        {activeTab === 'links' && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-slate-900">Links & Resume</h2>
            <InputField label="LinkedIn" field="linkedin_url" placeholder="https://linkedin.com/in/..." form={form} update={update} />
            <InputField label="GitHub" field="github_url" placeholder="https://github.com/..." form={form} update={update} />
            <InputField label="Portfolio" field="portfolio_url" placeholder="https://..." form={form} update={update} />

            <div className="border-t pt-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Resume</h3>
              {profile?.resume && (
                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-500" />
                  Current: {profile.resume.split('/').pop()}
                </p>
              )}
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 hover:border-primary hover:bg-primary/5 transition-all">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Upload PDF resume</span>
                <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
