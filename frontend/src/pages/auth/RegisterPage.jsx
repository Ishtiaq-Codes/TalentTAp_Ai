import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/common/Logo'

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

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between bg-gradient-to-br from-primary to-primary/80 p-12 text-primary-foreground">
        <Logo />
        <div>
          <h1 className="text-4xl font-bold">Join TalentTap AI</h1>
          <p className="mt-4 text-lg opacity-80">
            Create your account and start connecting with the best talent or opportunities.
          </p>
        </div>
        <p className="text-sm opacity-60">© 2025 TalentTap AI</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8"><Logo /></div>
          <h2 className="text-2xl font-bold">Create Account</h2>
          <p className="mt-1 text-sm text-muted-foreground">Get started in under a minute</p>

          {error && (
            <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Role selection */}
            <div className="flex gap-2">
              {['candidate', 'company_admin'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm({ ...form, role })}
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                    form.role === role ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                >
                  {role === 'candidate' ? '🎯 Candidate' : '🏢 Company'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium" htmlFor="reg-fname">First Name</label>
                <input id="reg-fname" required value={form.first_name} onChange={update('first_name')}
                  className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="reg-lname">Last Name</label>
                <input id="reg-lname" required value={form.last_name} onChange={update('last_name')}
                  className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="reg-email">Email</label>
              <input id="reg-email" type="email" required value={form.email} onChange={update('email')}
                className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="you@example.com" />
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="reg-pw">Password</label>
              <input id="reg-pw" type="password" required minLength={8} value={form.password} onChange={update('password')}
                className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••" />
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="reg-pw2">Confirm Password</label>
              <input id="reg-pw2" type="password" required value={form.password_confirm} onChange={update('password_confirm')}
                className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
