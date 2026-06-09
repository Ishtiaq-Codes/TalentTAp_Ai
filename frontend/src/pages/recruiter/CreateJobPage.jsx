import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobsAPI } from '@/api/jobs'
import { EMPLOYMENT_TYPE, REMOTE_STATUS } from '@/lib/constants'
import { ArrowLeft, Plus, X, Sparkles } from 'lucide-react'

export default function CreateJobPage() {
 const navigate = useNavigate()
 const [saving, setSaving] = useState(false)
 const [error, setError] = useState('')
 const [skillInput, setSkillInput] = useState('')
 const [form, setForm] = useState({
  title: '', description: '', experience_min: 0, experience_max: 3,
  employment_type: 'full_time', location: '', country: '', city: '',
  is_remote: 'onsite', salary_min: '', salary_max: '', salary_currency: 'USD',
  status: 'draft', skills: [],
 })
 
 const [optimizeLoading, setOptimizeLoading] = useState(false)
 const [optimizeResult, setOptimizeResult] = useState(null)

 const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

 const addSkill = (required = true) => {
  if (!skillInput.trim()) return
  setForm({
   ...form,
   skills: [...form.skills, { name: skillInput.trim(), is_required: required }],
  })
  setSkillInput('')
 }

 const removeSkill = (idx) => {
  setForm({ ...form, skills: form.skills.filter((_, i) => i !== idx) })
 }

 const handleOptimize = async () => {
  setOptimizeLoading(true)
  setOptimizeResult({ drafted_description: '' })
  try {
   await jobsAPI.optimizeStream({
    title: form.title,
    experience_level: `${form.experience_min} to ${form.experience_max} years`,
    salary_range: form.salary_min ? `${form.salary_currency} ${form.salary_min} - ${form.salary_max}` : '',
    location: form.city ? `${form.city}, ${form.country}` : form.country,
    type: form.employment_type,
    skills: form.skills
   }, (chunk) => {
    setOptimizeResult(prev => ({
     ...prev,
     drafted_description: (prev?.drafted_description || '') + chunk
    }))
   })
  } catch (err) {
   console.error(err)
  }
  setOptimizeLoading(false)
 }

 const handleSubmit = async (status) => {
  setError('')
  setSaving(true)
  try {
   const payload = { ...form, status }
   if (payload.salary_min === '') payload.salary_min = null
   if (payload.salary_max === '') payload.salary_max = null
   
   await jobsAPI.create(payload)
   navigate('/recruiter/jobs')
  } catch (err) {
   const data = err.response?.data
   setError(typeof data === 'object' ? JSON.stringify(data) : 'Failed to create job')
  } finally {
   setSaving(false)
  }
 }

 return (
  <div className="mx-auto max-w-3xl space-y-6">
   <div className="flex items-center gap-3">
    <button onClick={() => navigate(-1)} className="rounded-lg p-2 hover:bg-muted"><ArrowLeft className="h-5 w-5"/></button>
    <h1 className="text-2xl font-bold">Post a New Job</h1>
   </div>

   {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

   <section className="rounded-xl border bg-card p-6 space-y-4">
    <h2 className="text-lg font-semibold">Job Details</h2>
    <div>
     <label className="text-sm font-medium">Job Title</label>
     <input type="text"value={form.title} onChange={update('title')} placeholder="e.g. Senior Python Developer"
      className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
    </div>
   </section>

   <section className="rounded-xl border bg-card p-6 space-y-4">
    <h2 className="text-lg font-semibold">Requirements</h2>
    <div className="grid grid-cols-2 gap-4">
     <div>
      <label className="text-sm font-medium">Min Experience (years)</label>
      <input type="number"value={form.experience_min} onChange={update('experience_min')}
       className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
     </div>
     <div>
      <label className="text-sm font-medium">Max Experience (years)</label>
      <input type="number"value={form.experience_max} onChange={update('experience_max')}
       className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
     </div>
    </div>
    <div>
     <label className="text-sm font-medium">Employment Type</label>
     <select value={form.employment_type} onChange={update('employment_type')}
      className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
      {EMPLOYMENT_TYPE.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
     </select>
    </div>
    <div>
     <label className="text-sm font-medium">Remote Status</label>
     <select value={form.is_remote} onChange={update('is_remote')}
      className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
      {REMOTE_STATUS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
     </select>
    </div>
    <div className="grid grid-cols-2 gap-4">
     <div>
      <label className="text-sm font-medium">Country</label>
      <input type="text"value={form.country} onChange={update('country')}
       className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
     </div>
     <div>
      <label className="text-sm font-medium">City</label>
      <input type="text"value={form.city} onChange={update('city')}
       className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
     </div>
    </div>
   </section>

   <section className="rounded-xl border bg-card p-6 space-y-4">
    <h2 className="text-lg font-semibold">Salary</h2>
    <div className="grid grid-cols-3 gap-4">
     <div>
      <label className="text-sm font-medium">Min Salary</label>
      <input type="number"value={form.salary_min} onChange={update('salary_min')}
       className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
     </div>
     <div>
      <label className="text-sm font-medium">Max Salary</label>
      <input type="number"value={form.salary_max} onChange={update('salary_max')}
       className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
     </div>
     <div>
      <label className="text-sm font-medium">Currency</label>
      <input type="text"value={form.salary_currency} onChange={update('salary_currency')}
       className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"/>
     </div>
    </div>
   </section>

   <section className="rounded-xl border bg-card p-6 space-y-4">
    <h2 className="text-lg font-semibold">Skills</h2>
    <div className="flex flex-wrap gap-2">
     {form.skills.map((s, i) => (
      <span key={i} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm ${s.is_required ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
       {s.name} {s.is_required ? '(req)' : '(nice)'}
       <button onClick={() => removeSkill(i)}><X className="h-3 w-3"/></button>
      </span>
     ))}
    </div>
    <div className="flex gap-2">
     <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add a skill..."
      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
      className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none"/>
     <button onClick={() => addSkill(true)} className="rounded-lg bg-primary px-3 py-2 text-xs text-primary-foreground">Required</button>
     <button onClick={() => addSkill(false)} className="rounded-lg border px-3 py-2 text-xs hover:bg-muted">Nice-to-have</button>
    </div>
   </section>

   <section className="rounded-xl border bg-card p-6 space-y-4">
    <div className="flex items-center justify-between">
     <h2 className="text-lg font-semibold">Job Description</h2>
     <button onClick={handleOptimize} disabled={optimizeLoading || !form.title}
      className="inline-flex items-center gap-2 rounded-lg bg-ai/10 px-4 py-2 text-sm font-semibold text-ai hover:bg-ai/20 disabled:opacity-50 transition-colors">
      <Sparkles className="h-4 w-4"/> {optimizeLoading ? 'Drafting...' : 'Auto-Draft Description'}
     </button>
    </div>
    
    {optimizeResult?.drafted_description && (
     <div className="rounded-xl border border-ai/30 bg-ai/5 p-4 animate-in slide-in-from-top-2 mb-4">
      <div className="flex items-center justify-between mb-3">
       <h3 className="flex items-center gap-2 font-bold text-slate-900">
        <Sparkles className="h-5 w-5 text-ai"/> AI Draft Ready
       </h3>
       <button 
        onClick={() => {
         setForm(prev => ({ ...prev, description: optimizeResult.drafted_description }))
         setOptimizeResult(null)
        }}
        className="rounded-lg bg-ai px-4 py-1.5 text-sm font-semibold text-white hover:bg-ai/90 shadow-sm transition-all"
       >
        Apply to Description
       </button>
      </div>
      <div className="max-h-64 overflow-y-auto rounded bg-white p-3 border border-slate-200 text-sm font-mono whitespace-pre-wrap text-slate-700">
       {optimizeResult.drafted_description}
      </div>
     </div>
    )}

    <div>
     <textarea value={form.description} onChange={update('description')} rows={10}
      className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none font-mono"
      placeholder="Auto-draft using the button above or write the job description manually..."/>
    </div>
   </section>

   <div className="flex justify-end gap-3 pt-4 border-t">
    <button onClick={() => handleSubmit('draft')} disabled={saving}
     className="rounded-lg border px-6 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50">
     Save Draft
    </button>
    <button onClick={() => handleSubmit('active')} disabled={saving}
     className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
     {saving ? 'Publishing...' : 'Publish Job'}
    </button>
   </div>
  </div>
 )
}
