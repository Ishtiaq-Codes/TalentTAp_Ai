import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/common/Logo'
import { ArrowRight, Mail, Lock, User, Briefcase, Target, AlertCircle, Check, Sparkles } from 'lucide-react'
import SEOHead from '@/components/shared/SEOHead'

const PERKS_CANDIDATE = [
  'Free forever — no credit card needed',
  'AI matches you to relevant jobs automatically',
  'Get discovered by 500+ top companies',
  'Video interview prep powered by AI',
]

const PERKS_COMPANY = [
  '14-day Pro trial, no commitment',
  'AI ranks candidates by fit score instantly',
  'Invite your full recruiting team',
  'Direct messaging & auto-headhunter',
]

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '', first_name: '', last_name: '',
    password: '', password_confirm: '', role: 'candidate',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password_confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await register(form)
      navigate('/login', { state: { message: 'Account created! Please sign in.' } })
    } catch (err) {
      const data = err.response?.data
      const msg = typeof data === 'object' ? Object.values(data).flat().join(' ') : 'Registration failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })
  const isCompany = form.role === 'company_admin'
  const perks = isCompany ? PERKS_COMPANY : PERKS_CANDIDATE

  return (
    <>
      <SEOHead
        title="Create Free Account | TalentTap"
        description="Join TalentTap — the AI-powered hiring platform. Free for candidates, 14-day trial for companies."
      />

      <div className="flex min-h-screen">
        {/* ── Left Branding Panel ── */}
        <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden lg:flex bg-gradient-to-br from-[hsl(224,60%,8%)] via-[hsl(240,50%,12%)] to-[hsl(263,60%,14%)]">
          {/* Decorative orbs */}
          <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />

          <div className="relative z-10 p-10 flex-1 flex flex-col justify-between">
            <Logo theme="dark" />

            <div className="space-y-8">
              {/* Role-based headline */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/15 border border-violet-500/20 px-4 py-1.5 mb-5">
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs font-semibold text-violet-300 tracking-wide">
                    {isCompany ? 'For Hiring Teams' : 'For Job Seekers'}
                  </span>
                </div>

                <h1 className="text-4xl font-black text-white leading-[1.1] tracking-tight xl:text-5xl">
                  {isCompany ? (
                    <>Find Top Talent.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-amber-400">10× Faster.</span></>
                  ) : (
                    <>Get Discovered.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-amber-400">Land Your Dream Job.</span></>
                  )}
                </h1>

                <p className="mt-4 text-base text-slate-400 max-w-sm leading-relaxed">
                  {isCompany
                    ? 'Let AI surface the most qualified candidates for your roles — ranked, explained, and ready to hire.'
                    : "Create your profile once. Our AI does the rest — matching you to roles you'll actually love."
                  }
                </p>
              </div>

              {/* Perks list */}
              <ul className="space-y-3">
                {perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/20 border border-violet-500/30">
                      <Check className="h-3.5 w-3.5 text-violet-400" />
                    </div>
                    <span className="text-sm text-slate-300">{perk}</span>
                  </li>
                ))}
              </ul>

              {/* Social proof */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-2.5">
                  {['violet', 'blue', 'emerald', 'amber', 'rose'].map((c, i) => (
                    <div key={i} className={`h-8 w-8 rounded-full border-2 border-[hsl(224,60%,8%)] bg-gradient-to-br from-${c}-400 to-${c}-600 flex items-center justify-center text-[10px] font-bold text-white`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-400">
                  <span className="font-bold text-white">15,000+</span> users already joined
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">© {new Date().getFullYear()} TalentTap AI. All rights reserved.</p>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="flex flex-1 items-start justify-center overflow-y-auto bg-gradient-to-br from-slate-50 to-white p-6 sm:p-12">
          <div className="w-full max-w-[420px] animate-fade-in-up py-8">
            {/* Mobile logo */}
            <div className="mb-8 lg:hidden">
              <Logo />
            </div>

            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create your account</h2>
              <p className="mt-1.5 text-sm text-slate-500">Get started in under 60 seconds.</p>
            </div>

            {/* Role toggle — premium card-style */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-slate-700">I'm joining as a…</label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { role: 'candidate', icon: Target, label: 'Job Seeker', sub: 'Find opportunities' },
                  { role: 'company_admin', icon: Briefcase, label: 'Company', sub: 'Hire talent' },
                ].map(({ role, icon: Icon, label, sub }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm({ ...form, role })}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition-all ${
                      form.role === role
                        ? 'border-violet-500 bg-violet-50 shadow-sm shadow-violet-100'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                      form.role === role ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold leading-tight ${form.role === role ? 'text-violet-900' : 'text-slate-800'}`}>{label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                <AlertCircle className="mt-0.5 h-4.5 w-4.5 flex-shrink-0 text-red-500" style={{ height: '18px', width: '18px' }} />
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="reg-fname">First name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 pointer-events-none" style={{ height: '16px', width: '16px' }} />
                    <input
                      id="reg-fname" required value={form.first_name} onChange={update('first_name')}
                      className="input !pl-9" placeholder="Jane"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="reg-lname">Last name</label>
                  <input
                    id="reg-lname" required value={form.last_name} onChange={update('last_name')}
                    className="input" placeholder="Smith"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700" htmlFor="reg-email">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{ height: '18px', width: '18px' }} />
                  <input
                    id="reg-email" type="email" required value={form.email} onChange={update('email')}
                    className="input !pl-10" placeholder="you@company.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700" htmlFor="reg-pw">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{ height: '18px', width: '18px' }} />
                  <input
                    id="reg-pw" type="password" required minLength={8} value={form.password} onChange={update('password')}
                    className="input !pl-10" placeholder="Min. 8 characters"
                  />
                </div>
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700" htmlFor="reg-pw2">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{ height: '18px', width: '18px' }} />
                  <input
                    id="reg-pw2" type="password" required value={form.password_confirm} onChange={update('password_confirm')}
                    className="input !pl-10" placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Terms notice */}
              <p className="text-xs text-slate-400 leading-relaxed">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-violet-600 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-violet-600 hover:underline">Privacy Policy</Link>.
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3 text-base justify-center mt-2"
                style={{ borderRadius: '14px' }}
              >
                {loading ? (
                  <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    {isCompany ? 'Start Free Trial' : 'Create Free Account'}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-violet-600 hover:text-violet-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
