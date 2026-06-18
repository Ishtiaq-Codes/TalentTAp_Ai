import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth, getRedirectPath } from '@/contexts/AuthContext'
import Logo from '@/components/common/Logo'
import { ArrowRight, Mail, Lock, AlertCircle, Shield } from 'lucide-react'
import SEOHead from '@/components/shared/SEOHead'

const STATS = [
  { value: '15K+', label: 'Active Users' },
  { value: '92%', label: 'Match Accuracy' },
  { value: '3x', label: 'Faster Hiring' },
]

export default function LoginPage() {
  const { user, login, loginMFA } = useAuth()
  const navigate = useNavigate()

  if (user) return <Navigate to={getRedirectPath(user)} replace />

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mfaStep, setMfaStep] = useState(false)
  const [mfaToken, setMfaToken] = useState('')
  const [mfaCode, setMfaCode] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mfaStep) {
        const loggedInUser = await loginMFA(mfaToken, mfaCode)
        navigate(getRedirectPath(loggedInUser), { replace: true })
      } else {
        const res = await login(form.email, form.password)
        if (res.mfa_required) {
          setMfaToken(res.mfa_token)
          setMfaStep(true)
        } else {
          navigate(getRedirectPath(res), { replace: true })
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEOHead
        title="Sign In | TalentTap"
        description="Sign in to your TalentTap account to access your AI-powered hiring dashboard."
      />

      <div className="flex min-h-screen">
        {/* ── Left Branding Panel ── */}
        <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden lg:flex bg-gradient-to-br from-[hsl(224,60%,8%)] via-[hsl(240,50%,12%)] to-[hsl(263,60%,14%)]">
          {/* Decorative orbs */}
          <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute top-[40%] left-[20%] h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[80px] pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 p-10 flex-1 flex flex-col justify-between">
            {/* Logo */}
            <div>
              <Logo theme="dark" />
            </div>

            {/* Hero text */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/15 border border-violet-500/20 px-4 py-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-xs font-semibold text-violet-300 tracking-wide">AI-Powered Talent Intelligence</span>
              </div>

              <h1 className="text-4xl font-black text-white leading-[1.1] tracking-tight xl:text-5xl">
                Hire Smarter.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-amber-400">
                  Move Faster.
                </span>
              </h1>

              <p className="text-base text-slate-400 max-w-sm leading-relaxed">
                TalentTap's AI engine matches the right candidates to your roles — automatically, with full explainability.
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-6 pt-4">
                {STATS.map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-2xl font-black text-white">{value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} TalentTap AI. All rights reserved.
            </p>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-slate-50 to-white p-6 sm:p-12">
          <div className="w-full max-w-[400px] animate-fade-in-up">
            {/* Mobile logo */}
            <div className="mb-8 lg:hidden">
              <Logo />
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {mfaStep ? 'Two-Factor Verification' : 'Welcome back'}
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                {mfaStep
                  ? 'Enter the 6-digit code from your authenticator app.'
                  : 'Sign in to continue to your dashboard.'}
              </p>
            </div>

            {/* Error alert */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                <AlertCircle className="mt-0.5 h-4.5 w-4.5 flex-shrink-0 text-red-500" style={{ height: '18px', width: '18px' }} />
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!mfaStep ? (
                <>
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="login-email">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 pointer-events-none" style={{ height: '18px', width: '18px' }} />
                      <input
                        id="login-email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="input !pl-10"
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700" htmlFor="login-password">
                        Password
                      </label>
                      <Link to="/forgot-password" className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 pointer-events-none" style={{ height: '18px', width: '18px' }} />
                      <input
                        id="login-password"
                        type="password"
                        required
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="input !pl-10"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="login-mfa">
                    Authenticator Code
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 pointer-events-none" style={{ height: '18px', width: '18px' }} />
                    <input
                      id="login-mfa"
                      type="text"
                      maxLength={6}
                      required
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      className="input !pl-10 font-mono tracking-[0.4em] text-center text-lg"
                      placeholder="000000"
                    />
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full py-3 text-base justify-center"
                  style={{ borderRadius: '14px' }}
                >
                  {loading ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      {mfaStep ? 'Verify' : 'Sign In'}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-violet-600 hover:text-violet-700 transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
