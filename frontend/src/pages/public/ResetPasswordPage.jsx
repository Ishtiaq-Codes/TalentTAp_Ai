import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import { authAPI } from '@/api/auth'

export default function ResetPasswordPage() {
 const [searchParams] = useSearchParams()
 const navigate = useNavigate()
 
 const uid = searchParams.get('uid')
 const token = searchParams.get('token')
 
 const [password, setPassword] = useState('')
 const [showPassword, setShowPassword] = useState(false)
 const [loading, setLoading] = useState(false)
 const [success, setSuccess] = useState(false)
 const [error, setError] = useState('')

 // eslint-disable-next-line
 useEffect(() => {
  if (!uid || !token) {
   setError('Invalid or missing password reset link.')
  }
 }, [uid, token])

 const handleSubmit = async (e) => {
  e.preventDefault()
  if (!uid || !token) return
  
  setLoading(true)
  setError('')
  try {
   await authAPI.resetPassword(uid, token, password)
   setSuccess(true)
   setTimeout(() => navigate('/login'), 3000)
  } catch (err) {
   setError(err.response?.data?.detail || err.response?.data?.password?.[0] || 'Failed to reset password.')
  } finally {
   setLoading(false)
  }
 }

 if (success) {
  return (
   <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
    <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
     <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
      <CheckCircle className="h-8 w-8"/>
     </div>
     <h2 className="text-2xl font-bold text-slate-900">Password Reset!</h2>
     <p className="mt-2 text-slate-500">Your password has been successfully updated.</p>
     <p className="mt-6 text-sm text-slate-400">Redirecting to login...</p>
    </div>
   </div>
  )
 }

 return (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
   <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
    <div className="mb-8 text-center">
     <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
      <Lock className="h-6 w-6"/>
     </div>
     <h1 className="text-2xl font-bold text-slate-900">Set New Password</h1>
     <p className="mt-2 text-sm text-slate-500">Please enter your new password below.</p>
    </div>

    {error && (
     <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
      {error}
     </div>
    )}

    <form onSubmit={handleSubmit} className="space-y-5">
     <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">New Password</label>
      <div className="relative">
       <input
        type={showPassword ?"text":"password"}
        required
        disabled={!uid || !token}
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
        placeholder="••••••••"
       />
       <button
        type="button"
        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
        onClick={() => setShowPassword(!showPassword)}
       >
        {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
       </button>
      </div>
     </div>

     <button
      type="submit"
      disabled={loading || !uid || !token}
      className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md hover:bg-primary/90 disabled:opacity-50 transition-all"
     >
      {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin"/> : 'Update Password'}
     </button>
    </form>
    
    <div className="mt-6 text-center">
     <Link to="/login"className="text-sm font-semibold text-slate-600 hover:text-primary">
      Back to login
     </Link>
    </div>
   </div>
  </div>
 )
}
