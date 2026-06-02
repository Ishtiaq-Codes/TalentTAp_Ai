import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { companiesAPI } from '@/api/companies'
import { authAPI } from '@/api/auth'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowRight, Lock, Loader2 } from 'lucide-react'

export default function AcceptInvitePage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const [invite, setInvite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    companiesAPI.getInvite(token)
      .then(res => {
        setInvite(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.response?.data?.detail || 'Invalid or expired invitation.')
        setLoading(false)
      })
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await authAPI.acceptInvite(token, password)
      login(res.data.access, res.data.user)
      navigate('/recruiter/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to accept invitation.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !invite) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="mb-2 text-xl font-bold">Invitation Unavailable</h2>
          <p className="mb-6 text-muted-foreground">{error}</p>
          <button onClick={() => navigate('/')} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Return to Homepage
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">You're Invited!</h1>
          <p className="mt-2 text-muted-foreground">
            You have been invited to join the recruitment team.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={invite.email}
                disabled
                className="mt-1 block w-full rounded-lg border bg-muted px-4 py-3 text-sm text-muted-foreground outline-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">First Name</label>
                <input
                  type="text"
                  value={invite.first_name}
                  disabled
                  className="mt-1 block w-full rounded-lg border bg-muted px-4 py-3 text-sm text-muted-foreground outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Last Name</label>
                <input
                  type="text"
                  value={invite.last_name}
                  disabled
                  className="mt-1 block w-full rounded-lg border bg-muted px-4 py-3 text-sm text-muted-foreground outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Create Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Choose a strong password"
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="group mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? 'Accepting...' : 'Accept Invitation & Join'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
