import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, getDashboardPath } from '@/contexts/AuthContext'
import { candidatesAPI } from '@/api/candidates'
import { authAPI } from '@/api/auth'
import { User, Briefcase, Target, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

const SKILL_OPTIONS = [
  'React', 'Node.js', 'Python', 'Django', 'AWS', 'Docker', 'TypeScript', 'SQL',
  'MongoDB', 'GraphQL', 'Next.js', 'Vue.js', 'Angular', 'Java', 'C#', 'Go'
]

export default function CandidateOnboarding() {
  const { user, completeOnboarding } = useAuth()
  const navigate = useNavigate()
  const { success, error } = useToast()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [customSkill, setCustomSkill] = useState('')
  
  const [form, setForm] = useState({
    headline: '',
    bio: '',
    location: '',
    years_of_experience: 0,
    skills: [],
    remote_preference: 'flexible',
    career_goals: ''
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
        const { data } = await candidatesAPI.getProfile()
        if (data) {
          setForm(prev => ({
            ...prev,
            headline: data.headline || '',
            bio: data.bio || '',
            location: data.location || '',
            years_of_experience: data.years_of_experience || 0,
            skills: data.skills ? data.skills.map(s => s.name) : [],
            remote_preference: data.remote_preference || 'flexible',
            career_goals: data.career_goals || ''
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

  const handleNext = () => setStep(s => Math.min(s + 1, 3))
  const handlePrev = () => setStep(s => Math.max(s - 1, 1))

  const toggleSkill = (skill) => {
    if (!skill.trim()) return;
    
    // Check if removing
    if (form.skills.includes(skill)) {
      setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))
      return
    }
    
    // Check limit BEFORE state update to avoid React render crash
    if (form.skills.length >= 10) {
      error('You can select up to 10 skills.')
      return
    }
    
    setForm(prev => ({ ...prev, skills: [...prev.skills, skill] }))
  }

  const handleAddCustomSkill = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const formatted = customSkill.trim()
      if (formatted) {
        toggleSkill(formatted)
        setCustomSkill('')
      }
    }
  }

  const handleSkip = async () => {
    setSaving(true)
    try {
      await completeOnboarding()
    } catch (err) {
      error('Failed to skip onboarding.')
    } finally {
      setSaving(false)
    }
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      // Format skills payload as objects
      const payload = {
        ...form,
        skills: form.skills.map(name => ({ name }))
      }
      
      // Update profile
      await candidatesAPI.updateProfile(payload)
      
      // Complete onboarding
      await completeOnboarding()
      
      success('Profile setup complete! Welcome to TalentTap.')
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message
      error(`Failed to save profile: ${errorMsg}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex py-20 justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="w-full animate-fade-in-up">
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Step {step} of 3
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
          <div className={`h-full rounded-full transition-all duration-500 ${step >= 1 ? 'w-1/3 bg-primary' : 'w-0'}`} />
          <div className={`h-full rounded-full transition-all duration-500 ${step >= 2 ? 'w-1/3 bg-primary' : 'w-0'}`} />
          <div className={`h-full rounded-full transition-all duration-500 ${step >= 3 ? 'w-1/3 bg-primary' : 'w-0'}`} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">The Basics</h1>
                <p className="text-sm text-slate-500">Let's start with your professional identity.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Headline <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.headline}
                  onChange={e => setForm({...form, headline: e.target.value})}
                  placeholder="e.g. Senior Frontend Developer"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Short Bio</label>
                <textarea
                  rows={4}
                  value={form.bio}
                  onChange={e => setForm({...form, bio: e.target.value})}
                  placeholder="Tell companies a little bit about yourself..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Career Goals</label>
                <textarea
                  rows={4}
                  value={form.career_goals}
                  onChange={e => setForm({...form, career_goals: e.target.value})}
                  placeholder="e.g. Looking to transition into a Team Lead role, open to learning Rust..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Experience & Skills</h1>
                <p className="text-sm text-slate-500">What do you bring to the table?</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Years of Experience</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={form.years_of_experience}
                    onChange={e => setForm({...form, years_of_experience: parseInt(e.target.value)})}
                    className="flex-1 accent-primary"
                  />
                  <span className="w-16 rounded-lg bg-slate-100 py-1.5 text-center text-sm font-bold text-slate-700">
                    {form.years_of_experience}{form.years_of_experience === 20 ? '+' : ''} yrs
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Top Skills (Select up to 10)
                </label>
                <div className="flex flex-wrap gap-2">
                  {/* Render standard skills */}
                  {SKILL_OPTIONS.map(skill => {
                    const isSelected = form.skills.includes(skill)
                    return (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                          isSelected 
                            ? 'border-primary bg-primary text-white shadow-md shadow-primary/25' 
                            : 'border-slate-200 bg-white text-slate-600 hover:border-primary/50'
                        }`}
                      >
                        {skill}
                      </button>
                    )
                  })}

                  {/* Render custom skills not in SKILL_OPTIONS */}
                  {form.skills.filter(s => !SKILL_OPTIONS.includes(s)).map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className="rounded-full border border-primary bg-primary text-white shadow-md shadow-primary/25 px-4 py-2 text-sm font-medium transition-all"
                    >
                      {skill} ✕
                    </button>
                  ))}
                </div>
                
                {/* Custom Skill Input */}
                <div className="mt-4 max-w-sm">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={e => setCustomSkill(e.target.value)}
                    onKeyDown={handleAddCustomSkill}
                    placeholder="Type a custom skill and press Enter..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {form.skills.length > 0 && (
                  <p className="mt-3 text-xs font-medium text-primary">
                    {form.skills.length} / 10 selected
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Your Preferences</h1>
                <p className="text-sm text-slate-500">What kind of role are you looking for?</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Work Setup Preference</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['remote', 'hybrid', 'flexible', 'onsite'].map(pref => (
                    <button
                      key={pref}
                      onClick={() => setForm({...form, remote_preference: pref})}
                      className={`rounded-xl border-2 p-3 text-center text-sm font-semibold capitalize transition-all ${
                        form.remote_preference === pref
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Location (City)</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm({...form, location: e.target.value})}
                  placeholder="Enter exact city name (e.g. Lahore, London)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
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
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={step === 1 && !form.headline.trim()} // Require headline
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Target className="h-4 w-4" /> Complete Setup</>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
