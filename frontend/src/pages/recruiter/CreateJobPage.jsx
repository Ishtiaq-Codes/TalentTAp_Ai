import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobsAPI } from '@/api/jobs'
import { EMPLOYMENT_TYPE, REMOTE_STATUS } from '@/lib/constants'
import { ArrowLeft, Plus, X } from 'lucide-react'

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

  const handleSubmit = async (status) => {
    setError('')
    setSaving(true)
    try {
      await jobsAPI.create({ ...form, status })
      navigate('/recruiter/jobs')
    } catch (err) {
      const data = err.response?.data
      setError(typeof data === 'object' ? JSON.stringify(data) : 'Failed to create job')
    } finally {
      setSaving(false)
    }
  }

  const Input = ({ label, field, type = 'text', placeholder = '' }) => (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input type={type} value={form[field]} onChange={update(field)} placeholder={placeholder}
        className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
    </div>
  )

  const Select = ({ label, field, options }) => (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <select value={form[field]} onChange={update(field)}
        className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="rounded-lg p-2 hover:bg-muted"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="text-2xl font-bold">Post a New Job</h1>
      </div>

      {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Job Details</h2>
        <Input label="Job Title" field="title" placeholder="e.g. Senior Python Developer" />
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea value={form.description} onChange={update('description')} rows={6}
            className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            placeholder="Describe the role, responsibilities, and requirements..." />
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Requirements</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Min Experience (years)" field="experience_min" type="number" />
          <Input label="Max Experience (years)" field="experience_max" type="number" />
        </div>
        <Select label="Employment Type" field="employment_type" options={EMPLOYMENT_TYPE} />
        <Select label="Remote Status" field="is_remote" options={REMOTE_STATUS} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Country" field="country" />
          <Input label="City" field="city" />
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Salary</h2>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Min Salary" field="salary_min" type="number" />
          <Input label="Max Salary" field="salary_max" type="number" />
          <Input label="Currency" field="salary_currency" />
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {form.skills.map((s, i) => (
            <span key={i} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm ${s.is_required ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              {s.name} {s.is_required ? '(req)' : '(nice)'}
              <button onClick={() => removeSkill(i)}><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add a skill..."
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none" />
          <button onClick={() => addSkill(true)} className="rounded-lg bg-primary px-3 py-2 text-xs text-primary-foreground">Required</button>
          <button onClick={() => addSkill(false)} className="rounded-lg border px-3 py-2 text-xs hover:bg-muted">Nice-to-have</button>
        </div>
      </section>

      <div className="flex justify-end gap-3">
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
