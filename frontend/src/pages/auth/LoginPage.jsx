import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth, getRedirectPath } from '@/contexts/AuthContext'
import Logo from '@/components/common/Logo'
import { ArrowRight, Mail, Lock, AlertCircle, Shield } from 'lucide-react'
import SEOHead from '@/components/shared/SEOHead'

export default function LoginPage() {
  const { user, login, loginMFA } = useAuth()
  const navigate = useNavigate()

  if (user) return <Navigate to={getRedirectPath(user)} replace />
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // MFA state
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
      setError(err.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SEOHead 
        title="Log In | TalentTap"
        description="Log in to your TalentTap account to access your AI talent dashboard."
      />
      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-12 lg:flex">
        {/* Background blobs */}
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative z-10">
          <Logo collapsed={false} />
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-white xl:text-5xl">
            Welcome back to <br />
            <span className="text-primary">TalentTap AI</span>
          </h1>
          <p className="max-w-md text-lg text-slate-400">
            Sign in to access your AI-powered dashboard and continue connecting talent with opportunity.
          </p>

          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                  <div className="h-full w-full rounded-full bg-gradient-to-br from-primary/40 to-blue-600/40" />
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-slate-400">
              Join <span className="text-white">15,000+</span> users
            </p>
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          © {new Date().getFullYear()} TalentTap AI. All rights reserved.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Sign In</h2>
            <p className="mt-2 text-muted-foreground">Enter your credentials to continue to your account.</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!mfaStep ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="login-email">Email Address</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="block w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium" htmlFor="login-password">Password</label>
                    <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="login-password"
                      type="password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="block w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="login-mfa">Authenticator Code</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="login-mfa"
                    type="text"
                    maxLength={6}
                    required
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                    className="block w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm tracking-widest font-mono focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                    placeholder="000000"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
