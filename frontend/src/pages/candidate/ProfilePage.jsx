import { useState, useEffect } from 'react'
import { useFetch } from '@/hooks/useFetch'
import { candidatesAPI } from '@/api/candidates'
import { authAPI } from '@/api/auth'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/hooks/useNotifications'
import { notificationsAPI } from '@/api/notifications'
import SkeletonCard from '@/components/common/SkeletonCard'
import { getImageUrl } from '@/lib/utils'
import { EMPLOYMENT_STATUS, AVAILABILITY, EMPLOYMENT_TYPE, REMOTE_PREFERENCES } from '@/lib/constants'
import {
 Save, Plus, X, Upload, User, Briefcase, Code, FileText, Globe,
 Camera, CheckCircle, AlertCircle, ArrowRight, Sparkles, GraduationCap, Award
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
   className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"/>
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
       <AlertCircle className="h-3 w-3 text-amber-500 shrink-0"/>
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
 { id: 'education', label: 'Education', icon: GraduationCap },
 { id: 'certifications', label: 'Certifications', icon: Award },
 { id: 'links', label: 'Links', icon: Globe },
]

 export default function ProfilePage() {
  const { user, fetchUser } = useAuth()
  const { data: profile, loading, refetch } = useFetch(() => candidatesAPI.getProfile())
  const { unreadCount } = useNotifications()
  
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [skillProficiency, setSkillProficiency] = useState('intermediate')
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('basic')
  const [showExpForm, setShowExpForm] = useState(false)
  const [expForm, setExpForm] = useState({ company_name: '', title: '', start_date: '', end_date: '', is_current: false, description: '' })
  const [showEduForm, setShowEduForm] = useState(false)
  const [eduForm, setEduForm] = useState({ institution_name: '', degree: '', field_of_study: '', start_date: '', end_date: '', description: '' })
  const [showCertForm, setShowCertForm] = useState(false)
  const [certForm, setCertForm] = useState({ name: '', issuing_organization: '', issue_date: '', expiration_date: '', credential_id: '', credential_url: '' })

  const [prevUnreadCount, setPrevUnreadCount] = useState(unreadCount)

  // Auto-refresh the profile data when a new notification arrives (e.g. AI parsing finished)
  useEffect(() => {
    if (unreadCount > prevUnreadCount) {
      refetch(true).then((newData) => {
        if (newData) setForm({ ...newData })
        setIsParsing(false)
        
        // Check the newest notification to see if parsing succeeded or failed
        notificationsAPI.list().then(res => {
           const latest = (res.data.results || res.data || [])[0]
           if (latest && (latest.title.includes('Failed') || latest.title.includes('Delayed'))) {
               setMessage('AI Analysis failed: AI servers are extremely busy right now. Please try again later.')
           } else if (latest && latest.title.includes('Analyzed')) {
               setMessage('AI Analysis complete! Your profile has been auto-updated.')
           } else {
               setMessage('Profile auto-updated from background task.')
           }
        }).catch(() => {
           setMessage('Background process completed. Check your notifications.')
        })
      })
    }
    setPrevUnreadCount(unreadCount)
  }, [unreadCount, prevUnreadCount, refetch])

  // Auto-hide messages after 7 seconds
  useEffect(() => {
    if (message && !isParsing) {
      const timer = setTimeout(() => setMessage(''), 7000)
      return () => clearTimeout(timer)
    }
  }, [message, isParsing])

  // Initialize form when profile loads
  if (profile && !form) setForm({ ...profile })

 if (loading && !form) return <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
 if (!form) return null

 const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

 const handleSave = async () => {
  setSaving(true)
  setMessage('')
  try {
   const { skills, experiences, education, certifications, user_name, user_email, avatar, resume, ...data } = form
   await candidatesAPI.updateProfile(data)
   setMessage('Profile saved!')
   refetch(true)
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
   refetch(true)
  } catch { /* skill may already exist */ }
 }

 const handleDeleteSkill = async (id) => {
  await candidatesAPI.deleteSkill(id)
  refetch(true)
 }

 const handleAddExperience = async (e) => {
  e.preventDefault()
  try {
   await candidatesAPI.addExperience(expForm)
   setExpForm({ company_name: '', title: '', start_date: '', end_date: '', is_current: false, description: '' })
   setShowExpForm(false)
   refetch(true)
  } catch {
   setMessage('Error adding experience')
  }
 }

 const handleDeleteExperience = async (id) => {
  await candidatesAPI.deleteExperience(id)
  refetch(true)
 }

 const handleAddEducation = async (e) => {
  e.preventDefault()
  try {
   await candidatesAPI.addEducation(eduForm)
   setEduForm({ institution_name: '', degree: '', field_of_study: '', start_date: '', end_date: '', description: '' })
   setShowEduForm(false)
   refetch(true)
  } catch {
   setMessage('Error adding education')
  }
 }

 const handleDeleteEducation = async (id) => {
  await candidatesAPI.deleteEducation(id)
  refetch(true)
 }

 const handleAddCertification = async (e) => {
  e.preventDefault()
  try {
   await candidatesAPI.addCertification(certForm)
   setCertForm({ name: '', issuing_organization: '', issue_date: '', expiration_date: '', credential_id: '', credential_url: '' })
   setShowCertForm(false)
   refetch(true)
  } catch {
   setMessage('Error adding certification')
  }
 }

 const handleDeleteCertification = async (id) => {
  await candidatesAPI.deleteCertification(id)
  refetch(true)
 }

 const handleResumeUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  try {
   setIsParsing(true)
   setMessage('Uploading and analyzing with AI...')
   const res = await candidatesAPI.uploadResume(file)
   
   setForm(res.data)
   setIsParsing(false)
   setMessage('Resume uploaded! AI is analyzing your profile in the background. Please refresh the page in a few moments.')
   refetch(true)
  } catch {
   setIsParsing(false)
   setMessage('Error uploading resume')
  }
 }

 const handleAvatarUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  try {
   await authAPI.uploadAvatar(file)
   setMessage('Avatar uploaded successfully!')
   refetch(true)
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
   refetch(true)
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
   <div className="overflow-hidden glass-card rounded-2xl">
    <div className="h-36 bg-slate-100 relative group">
     {profile?.banner_image ? (
      <img src={getImageUrl(profile.banner_image)} className="h-full w-full object-cover"/>
     ) : (
      <div className="h-full w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800"/>
     )}
     <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all cursor-pointer">
      <span className="hidden group-hover:flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-lg">
       <Camera className="h-4 w-4"/> Change Banner
      </span>
      <input type="file"accept="image/*"className="hidden"onChange={handleBannerUpload} />
     </label>
    </div>

    <div className="px-6 pb-5">
     <div className="flex items-end gap-4">
      <div className="-mt-10 relative group shrink-0">
       <div className="h-20 w-20 overflow-hidden rounded-xl border-4 border-white bg-white shadow-md">
        {profile?.avatar ? (
         <img src={getImageUrl(profile.avatar)} className="h-full w-full object-cover"/>
        ) : (
         <div className="flex h-full w-full items-center justify-center bg-primary/10 text-2xl font-bold text-primary">{profile?.user_name?.[0] || '?'}</div>
        )}
       </div>
       <label className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 group-hover:bg-black/40 transition-all cursor-pointer">
        <Camera className="h-5 w-5 text-white hidden group-hover:block"/>
        <input type="file"accept="image/*"className="hidden"onChange={handleAvatarUpload} />
       </label>
      </div>
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
       <div>
        <h1 className="text-xl font-bold text-slate-900">{profile?.user_name || 'Your Name'}</h1>
        <p className="text-sm text-muted-foreground">{form.headline || 'Add a professional headline'}</p>
       </div>
       <button onClick={handleSave} disabled={saving}
        className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-all">
        <Save className="h-4 w-4"/> {saving ? 'Saving...' : 'Save Changes'}
       </button>
      </div>
     </div>
    </div>
   </div>

   {message && (
    <div className={`rounded-lg p-3 text-sm font-medium flex items-center gap-2 ${message.includes('Error') ? 'bg-red-50 text-red-700' : isParsing ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
     {message.includes('Error') ? <AlertCircle className="h-4 w-4"/> : isParsing ? <Sparkles className="h-4 w-4 animate-pulse"/> : <CheckCircle className="h-4 w-4"/>}
     {message}
    </div>
   )}

   {/* ─── AI Resume Upload Banner ─── */}
   <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50/50 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
    <div className="absolute -right-10 -top-10 opacity-10 blur-xl">
     <Sparkles className="h-40 w-40 text-blue-600"/>
    </div>
    <div className="relative z-10">
     <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
      <Sparkles className="h-5 w-5 text-indigo-600"/> Let AI build your profile
     </h2>
     <p className="text-sm text-slate-600 mt-1 max-w-xl">
      Upload your resume and our advanced AI will instantly populate your experience, education, skills, and links below.
     </p>
     {profile?.resume && (
      <p className="text-xs font-medium text-indigo-700 mt-2 flex items-center gap-1.5 bg-indigo-100/50 w-fit px-2.5 py-1 rounded-full">
       <CheckCircle className="h-3 w-3"/> Current: {profile.resume.split('/').pop()}
      </p>
     )}
    </div>
    <label className={`relative z-10 shrink-0 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all shadow-sm ${isParsing ? 'bg-indigo-100 text-indigo-400 cursor-wait' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow'}`}>
     {isParsing ? <Sparkles className="h-4 w-4 animate-pulse"/> : <Upload className="h-4 w-4"/>}
     {isParsing ? 'AI is analyzing...' : 'Upload Resume'}
     <input type="file"accept=".pdf"disabled={isParsing} className="hidden"onChange={handleResumeUpload} />
    </label>
   </div>

   {/* ─── Profile Strength ─── */}
   <ProfileStrengthBanner completion={completion} suggestions={suggestions} />

   {/* ─── Tab Navigation ─── */}
   <div className="flex gap-1 glass-card rounded-xl p-1 overflow-x-auto">
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
       <Icon className="h-4 w-4"/> {tab.label}
      </button>
     )
    })}
   </div>

   {/* ─── Tab Content ─── */}
   <div className="glass-card rounded-2xl p-6">
    {/* Basic Info Tab */}
    {activeTab === 'basic' && (
     <div className="space-y-5">
      <h2 className="text-base font-bold text-slate-900">Basic Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email (Account)</label>
        <input type="text"disabled value={user?.email || profile?.user_email || ''}
         className="mt-1.5 block w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-sm text-slate-400"/>
       </div>
       <InputField label="Phone"field="phone"form={form} update={update} />
      </div>
      <InputField label="Headline"field="headline"placeholder="e.g. Full-Stack Developer"form={form} update={update} />
      <div>
       <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">About</label>
       <textarea value={form.about || ''} onChange={update('about')} rows={4} placeholder="Write a professional summary..."
        className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"/>
      </div>
      <div>
       <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Career Goals</label>
       <textarea value={form.career_goals || ''} onChange={update('career_goals')} rows={3} placeholder="What are your long-term career objectives?"
        className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"/>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       <InputField label="Country"field="country"form={form} update={update} />
       <InputField label="City"field="city"form={form} update={update} />
      </div>
     </div>
    )}

    {/* Professional Tab */}
    {activeTab === 'professional' && (
     <div className="space-y-5">
      <h2 className="text-base font-bold text-slate-900">Professional Details</h2>
      <InputField label="Years of Experience"field="years_of_experience"type="number"form={form} update={update} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       <SelectField label="Employment Status"field="employment_status"options={EMPLOYMENT_STATUS} form={form} update={update} />
       <SelectField label="Availability"field="availability"options={AVAILABILITY} form={form} update={update} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       <SelectField label="Preferred Employment Type"field="employment_type_preferred"options={EMPLOYMENT_TYPE} form={form} update={update} />
       <SelectField label="Remote Preference"field="remote_preference"options={REMOTE_PREFERENCES} form={form} update={update} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
       <InputField label="Min Salary"field="salary_min"type="number"form={form} update={update} />
       <InputField label="Max Salary"field="salary_max"type="number"form={form} update={update} />
       <InputField label="Currency"field="salary_currency"form={form} update={update} />
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
          <X className="h-3.5 w-3.5"/>
         </button>
        </span>
       ))}
      </div>
      <div className="flex gap-2">
       <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add a skill..."
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
        className="flex-1 rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"/>
       <select value={skillProficiency} onChange={(e) => setSkillProficiency(e.target.value)}
        className="rounded-lg border bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none capitalize">
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
        <option value="expert">Expert</option>
       </select>
       <button onClick={handleAddSkill} className="rounded-lg bg-primary px-4 py-2.5 text-white hover:bg-primary/90 transition-colors">
        <Plus className="h-4 w-4"/>
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
        <Plus className="h-4 w-4"/> Add Experience
       </button>
      </div>

      {showExpForm && (
       <form onSubmit={handleAddExperience} className="rounded-xl border bg-slate-50/50 p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Title</label>
          <input required value={expForm.title} onChange={e => setExpForm({ ...expForm, title: e.target.value })}
           className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
         </div>
         <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</label>
          <input required value={expForm.company_name} onChange={e => setExpForm({ ...expForm, company_name: e.target.value })}
           className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
         </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Date</label>
          <input type="date"required value={expForm.start_date} onChange={e => setExpForm({ ...expForm, start_date: e.target.value })}
           className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
         </div>
         <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">End Date</label>
          <input type="date"disabled={expForm.is_current} value={expForm.end_date} onChange={e => setExpForm({ ...expForm, end_date: e.target.value })}
           className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none disabled:bg-slate-100"/>
         </div>
        </div>
        <div className="flex items-center gap-2">
         <input type="checkbox"id="current"checked={expForm.is_current} onChange={e => setExpForm({ ...expForm, is_current: e.target.checked, end_date: '' })} className="rounded border-slate-300"/>
         <label htmlFor="current"className="text-sm font-medium cursor-pointer">I currently work here</label>
        </div>
        <div>
         <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
         <textarea value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} rows={3}
          className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
        </div>
        <div className="flex justify-end gap-2">
         <button type="button"onClick={() => setShowExpForm(false)} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
         <button type="submit"className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">Save Experience</button>
        </div>
       </form>
      )}

      {profile?.experiences?.length > 0 ? (
       <div className="space-y-3">
        {profile.experiences.map((exp) => (
         <div key={exp.id} className="relative rounded-xl border p-4 hover:shadow-sm transition-shadow group">
          <button onClick={() => handleDeleteExperience(exp.id)} className="absolute right-3 top-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
           <X className="h-4 w-4"/>
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

    {/* Education Tab */}
    {activeTab === 'education' && (
     <div className="space-y-5">
      <div className="flex items-center justify-between">
       <h2 className="text-base font-bold text-slate-900">Education</h2>
       <button onClick={() => setShowEduForm(!showEduForm)}
        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
        <Plus className="h-4 w-4"/> Add Education
       </button>
      </div>

      {showEduForm && (
       <form onSubmit={handleAddEducation} className="rounded-xl border bg-slate-50/50 p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Institution Name</label>
          <input required value={eduForm.institution_name} onChange={e => setEduForm({ ...eduForm, institution_name: e.target.value })}
           className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
         </div>
         <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Degree</label>
          <input required value={eduForm.degree} onChange={e => setEduForm({ ...eduForm, degree: e.target.value })}
           className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
         </div>
        </div>
        <div>
         <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Field of Study</label>
         <input value={eduForm.field_of_study} onChange={e => setEduForm({ ...eduForm, field_of_study: e.target.value })}
          className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Date</label>
          <input type="date"required value={eduForm.start_date} onChange={e => setEduForm({ ...eduForm, start_date: e.target.value })}
           className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
         </div>
         <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">End Date (or expected)</label>
          <input type="date"value={eduForm.end_date} onChange={e => setEduForm({ ...eduForm, end_date: e.target.value })}
           className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
         </div>
        </div>
        <div>
         <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
         <textarea value={eduForm.description} onChange={e => setEduForm({ ...eduForm, description: e.target.value })} rows={3}
          className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
        </div>
        <div className="flex justify-end gap-2">
         <button type="button"onClick={() => setShowEduForm(false)} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
         <button type="submit"className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">Save Education</button>
        </div>
       </form>
      )}

      {profile?.education?.length > 0 ? (
       <div className="space-y-3">
        {profile.education.map((edu) => (
         <div key={edu.id} className="relative rounded-xl border p-4 hover:shadow-sm transition-shadow group">
          <button onClick={() => handleDeleteEducation(edu.id)} className="absolute right-3 top-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
           <X className="h-4 w-4"/>
          </button>
          <h3 className="font-bold text-slate-900">{edu.degree}</h3>
          <p className="font-medium text-primary text-sm">{edu.institution_name}</p>
          <p className="text-xs text-muted-foreground mt-1 mb-2">{edu.start_date} — {edu.end_date || 'Present'}</p>
          {edu.field_of_study && <p className="text-sm font-medium text-slate-700 mb-1">Field of Study: {edu.field_of_study}</p>}
          {edu.description && <p className="text-sm text-slate-600 leading-relaxed">{edu.description}</p>}
         </div>
        ))}
       </div>
      ) : (
       <p className="text-sm text-muted-foreground py-2">No education added yet.</p>
      )}
     </div>
    )}

    {/* Certifications Tab */}
    {activeTab === 'certifications' && (
     <div className="space-y-5">
      <div className="flex items-center justify-between">
       <h2 className="text-base font-bold text-slate-900">Certifications</h2>
       <button onClick={() => setShowCertForm(!showCertForm)}
        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
        <Plus className="h-4 w-4"/> Add Certification
       </button>
      </div>

      {showCertForm && (
       <form onSubmit={handleAddCertification} className="rounded-xl border bg-slate-50/50 p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Certification Name</label>
          <input required value={certForm.name} onChange={e => setCertForm({ ...certForm, name: e.target.value })}
           className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
         </div>
         <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Issuing Organization</label>
          <input required value={certForm.issuing_organization} onChange={e => setCertForm({ ...certForm, issuing_organization: e.target.value })}
           className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
         </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Issue Date</label>
          <input type="date"value={certForm.issue_date} onChange={e => setCertForm({ ...certForm, issue_date: e.target.value })}
           className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
         </div>
         <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiration Date</label>
          <input type="date"value={certForm.expiration_date} onChange={e => setCertForm({ ...certForm, expiration_date: e.target.value })}
           className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
         </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Credential ID</label>
          <input value={certForm.credential_id} onChange={e => setCertForm({ ...certForm, credential_id: e.target.value })}
           className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
         </div>
         <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Credential URL</label>
          <input type="url"value={certForm.credential_url} onChange={e => setCertForm({ ...certForm, credential_url: e.target.value })}
           className="mt-1.5 block w-full rounded-lg border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
         </div>
        </div>
        <div className="flex justify-end gap-2">
         <button type="button"onClick={() => setShowCertForm(false)} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
         <button type="submit"className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">Save Certification</button>
        </div>
       </form>
      )}

      {profile?.certifications?.length > 0 ? (
       <div className="space-y-3">
        {profile.certifications.map((cert) => (
         <div key={cert.id} className="relative rounded-xl border p-4 hover:shadow-sm transition-shadow group">
          <button onClick={() => handleDeleteCertification(cert.id)} className="absolute right-3 top-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
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
             <a href={cert.credential_url} target="_blank"rel="noreferrer"className="text-primary hover:underline inline-flex items-center gap-1">
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
    )}

    {/* Links Tab */}
    {activeTab === 'links' && (
     <div className="space-y-5">
      <h2 className="text-base font-bold text-slate-900">Professional Links</h2>
      <InputField label="LinkedIn"field="linkedin_url"placeholder="https://linkedin.com/in/..."form={form} update={update} />
      <InputField label="GitHub"field="github_url"placeholder="https://github.com/..."form={form} update={update} />
      <InputField label="Portfolio"field="portfolio_url"placeholder="https://..."form={form} update={update} />
     </div>
    )}
   </div>
  </div>
 )
}
