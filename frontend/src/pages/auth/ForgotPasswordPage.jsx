import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '@/api/auth'
import Logo from '@/components/common/Logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.forgotPassword(email)
      setSent(true)
    } catch { /* always show success for security */ }
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center"><Logo /></div>

        {sent ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <span className="text-2xl">📧</span>
            </div>
            <h2 className="text-xl font-bold">Check Your Email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              If an account exists for {email}, we've sent a password reset link.
            </p>
            <Link to="/login" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-8">
            <h2 className="text-xl font-bold">Forgot Password</h2>
            <p className="mt-1 text-sm text-muted-foreground">We'll send you a reset link.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium" htmlFor="fp-email">Email</label>
                <input id="fp-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline">Back to Sign In</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
