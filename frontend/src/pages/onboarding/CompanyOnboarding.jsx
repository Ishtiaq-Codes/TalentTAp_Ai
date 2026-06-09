import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, getDashboardPath } from '@/contexts/AuthContext'
import { companiesAPI } from '@/api/companies'
import { authAPI } from '@/api/auth'
import { Building2, Globe, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

export default function CompanyOnboarding() {
 const { user, completeOnboarding } = useAuth()
 const navigate = useNavigate()
 const { addToast } = useToast()
 
 const [step, setStep] = useState(1)
 const [loading, setLoading] = useState(false)
 const [saving, setSaving] = useState(false)
 
 const [form, setForm] = useState({
  name: '',
  industry: '',
  company_size: '1-10',
  location: '',
  website: '',
  description: ''
 })

 // Navigate away when onboarded
 useEffect(() => {
  if (user?.is_onboarded) {
   navigate(getDashboardPath(user.role), { replace: true })
  }
 }, [user, navigate])

 // Fetch existing profile data if any
 useEffect(() => {
  const fetchProfile = async () => {
   setLoading(true)
   try {
    const { data } = await companiesAPI.getProfile()
    if (data) {
     setForm(prev => ({
      ...prev,
      name: data.name !== 'New Company' ? data.name : '',
      industry: data.industry || '',
      company_size: data.company_size || '1-10',
      location: data.location || '',
      website: data.website || '',
      description: data.description || ''
     }))
    }
   } catch (err) {
    console.error("Failed to fetch profile", err)
   } finally {
    setLoading(false)
   }
  }
  fetchProfile()
 }, [])

 const handleNext = () => setStep(s => Math.min(s + 1, 2))
 const handlePrev = () => setStep(s => Math.max(s - 1, 1))

 const handleSkip = async () => {
  setSaving(true)
  try {
   await completeOnboarding()
  } catch (err) {
   addToast('error', 'Failed to skip onboarding.')
  } finally {
   setSaving(false)
  }
 }

 const handleFinish = async () => {
  setSaving(true)
  try {
   // Update profile
   await companiesAPI.updateProfile(form)
   
   // Complete onboarding
   await completeOnboarding()
   
   addToast('success', 'Company profile setup complete! Welcome to TalentTap.')
  } catch (err) {
   console.error(err)
   const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message
   addToast('error', `Failed to save profile: ${errorMsg}`)
  } finally {
   setSaving(false)
  }
 }

 if (loading) {
  return (
   <div className="flex py-20 justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
   </div>
  )
 }

 return (
  <div className="w-full animate-fade-in-up">
   {/* Progress Bar */}
   <div className="mb-10">
    <div className="flex items-center justify-between mb-2">
     <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
      Step {step} of 2
     </span>
     <button 
      onClick={handleSkip}
      disabled={saving}
      className="text-sm font-medium text-slate-400 hover:text-slate-700 transition-colors"
     >
      Skip for now
     </button>
    </div>
    <div className="flex h-2 w-full gap-2 overflow-hidden rounded-full bg-slate-100">
     <div className={`h-full rounded-full transition-all duration-500 ${step >= 1 ? 'w-1/2 bg-primary' : 'w-0'}`} />
     <div className={`h-full rounded-full transition-all duration-500 ${step >= 2 ? 'w-1/2 bg-primary' : 'w-0'}`} />
    </div>
   </div>

   <div className="glass-card rounded-2xl p-8">
    {step === 1 && (
     <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
       <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
        <Building2 className="h-6 w-6"/>
       </div>
       <div>
        <h1 className="text-2xl font-bold text-slate-900">Company Details</h1>
        <p className="text-sm text-slate-500">Let's set up your employer brand.</p>
       </div>
      </div>

      <div className="space-y-4">
       <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Company Name <span className="text-red-500">*</span></label>
        <input
         type="text"
         value={form.name}
         onChange={e => setForm({...form, name: e.target.value})}
         placeholder="e.g. Acme Corp"
         className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
       </div>

       <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Industry</label>
        <input
         type="text"
         value={form.industry}
         onChange={e => setForm({...form, industry: e.target.value})}
         placeholder="e.g. SaaS, FinTech, E-commerce"
         className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
       </div>

       <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Company Size</label>
        <select
         value={form.company_size}
         onChange={e => setForm({...form, company_size: e.target.value})}
         className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
         <option value="1-10">1-10 employees</option>
         <option value="11-50">11-50 employees</option>
         <option value="51-200">51-200 employees</option>
         <option value="201-500">201-500 employees</option>
         <option value="500+">500+ employees</option>
        </select>
       </div>
      </div>
     </div>
    )}

    {step === 2 && (
     <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
       <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
        <Globe className="h-6 w-6"/>
       </div>
       <div>
        <h1 className="text-2xl font-bold text-slate-900">Digital Presence</h1>
        <p className="text-sm text-slate-500">Help candidates learn more about your culture.</p>
       </div>
      </div>

      <div className="space-y-4">
       <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Website URL</label>
        <input
         type="url"
         value={form.website}
         onChange={e => setForm({...form, website: e.target.value})}
         placeholder="https://example.com"
         className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
       </div>

       <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Headquarters / Location</label>
        <input
         type="text"
         value={form.location}
         onChange={e => setForm({...form, location: e.target.value})}
         placeholder="e.g. San Francisco, CA"
         className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
       </div>

       <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Company Description</label>
        <textarea
         rows={4}
         value={form.description}
         onChange={e => setForm({...form, description: e.target.value})}
         placeholder="What makes your company a great place to work?"
         className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
       </div>
      </div>
     </div>
    )}

    {/* Navigation Buttons */}
    <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
     <button
      onClick={handlePrev}
      disabled={step === 1 || saving}
      className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-0"
     >
      <ArrowLeft className="h-4 w-4"/> Back
     </button>

     {step < 2 ? (
      <button
       onClick={handleNext}
       disabled={step === 1 && !form.name.trim()} // Require company name
       className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:bg-primary/90 disabled:opacity-50"
      >
       Continue <ArrowRight className="h-4 w-4"/>
      </button>
     ) : (
      <button
       onClick={handleFinish}
       disabled={saving}
       className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 disabled:opacity-50"
      >
       {saving ? (
        <><Loader2 className="h-4 w-4 animate-spin"/> Saving...</>
       ) : (
        <><Globe className="h-4 w-4"/> Complete Setup</>
       )}
      </button>
     )}
    </div>

   </div>
  </div>
 )
}
