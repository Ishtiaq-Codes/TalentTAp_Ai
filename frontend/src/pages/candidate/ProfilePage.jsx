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
import { ProfileStrengthBanner } from '@/components/common/ProfileStrength'
import ExperienceTab from './tabs/ExperienceTab'
import EducationTab from './tabs/EducationTab'
import CertificationsTab from './tabs/CertificationsTab'

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
     <ExperienceTab profile={profile} refetch={refetch} setMessage={setMessage} />
    )}

    {/* Education Tab */}
    {activeTab === 'education' && (
     <EducationTab profile={profile} refetch={refetch} setMessage={setMessage} />
    )}

    {/* Certifications Tab */}
    {activeTab === 'certifications' && (
     <CertificationsTab profile={profile} refetch={refetch} setMessage={setMessage} />
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
