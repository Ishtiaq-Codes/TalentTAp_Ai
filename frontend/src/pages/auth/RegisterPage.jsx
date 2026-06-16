import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/common/Logo'
import { ArrowRight, Mail, Lock, User, Briefcase, Target, AlertCircle } from 'lucide-react'
import SEOHead from '@/components/shared/SEOHead'

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
      <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none lg:w-1/2 lg:left-1/2">
        <div className="absolute top-[10%] right-[10%] h-[40vw] w-[40vw] max-w-[500px] animate-pulse-soft rounded-full bg-gradient-to-br from-primary/20 to-ai/20 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[10%] h-[40vw] w-[40vw] max-w-[500px] animate-pulse-soft rounded-full bg-gradient-to-tr from-blue-500/20 to-primary/20 blur-[100px]" style={{ animationDelay: '2s' }} />
      </div>
   <SEOHead 
    title="Create Free Account | TalentTap"
    description="Create your free TalentTap account. Join the global AI-powered hiring platform to hire or get hired."
   />
   {/* Left panel - branding */}
   <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-12 lg:flex">
    {/* Background blobs */}
    <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl"/>
    <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-3xl"/>

    <div className="relative z-10">
     <Logo collapsed={false} theme="dark" />
    </div>

    <div className="relative z-10 space-y-6">
     <h1 className="text-4xl font-bold tracking-tight text-white xl:text-5xl">
      Join the future of <br />
      <span className="text-primary">hiring today.</span>
     </h1>
     <p className="max-w-md text-lg text-slate-400">
      Create your account to start getting discovered by top companies, or finding the perfect candidates.
     </p>
     
     <div className="mt-8 space-y-4">
      <div className="flex items-center gap-3 text-slate-300">
       <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">✓</div>
       <p>Free forever for candidates</p>
      </div>
      <div className="flex items-center gap-3 text-slate-300">
       <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">✓</div>
       <p>AI-powered accurate matching</p>
      </div>
      <div className="flex items-center gap-3 text-slate-300">
       <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">✓</div>
       <p>No endless applications</p>
      </div>
     </div>
    </div>

    <div className="relative z-10 text-sm text-slate-500">
     © {new Date().getFullYear()} TalentTap AI. All rights reserved.
    </div>
   </div>

   {/* Right panel - form */}
   <div className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-8">
    <div className="w-full max-w-md animate-fade-in-up glass-panel rounded-3xl p-6 sm:p-10 border-white/60 shadow-2xl">
     <div className="mb-8 lg:hidden">
      <Logo />
     </div>

     <div className="mb-8">
      <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
      <p className="mt-2 text-muted-foreground">Get started in under a minute.</p>
     </div>

     {error && (
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
       <AlertCircle className="h-5 w-5 flex-shrink-0"/>
       {error}
      </div>
     )}

     <form onSubmit={handleSubmit} className="space-y-5">
      {/* Role selection */}
      <div className="space-y-3">
       <label className="text-sm font-medium">I am a...</label>
       <div className="grid grid-cols-2 gap-3">
        <button
         type="button"
         onClick={() => setForm({ ...form, role: 'candidate' })}
         className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
          form.role === 'candidate' 
           ? 'border-primary bg-primary/5 text-primary shadow-sm' 
           : 'border-border bg-white/60 backdrop-blur-sm text-muted-foreground hover:bg-slate-50'
         }`}
        >
         <Target className={`h-6 w-6 ${form.role === 'candidate' ? 'text-primary' : 'text-slate-400'}`} />
         <span className="text-sm font-semibold text-foreground">Candidate</span>
        </button>
        <button
         type="button"
         onClick={() => setForm({ ...form, role: 'company_admin' })}
         className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
          form.role === 'company_admin' 
           ? 'border-primary bg-primary/5 text-primary shadow-sm' 
           : 'border-border bg-white/60 backdrop-blur-sm text-muted-foreground hover:bg-slate-50'
         }`}
        >
         <Briefcase className={`h-6 w-6 ${form.role === 'company_admin' ? 'text-primary' : 'text-slate-400'}`} />
         <span className="text-sm font-semibold text-foreground">Company</span>
        </button>
       </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
       <div className="space-y-1.5">
        <label className="text-sm font-medium"htmlFor="reg-fname">First Name</label>
        <div className="relative">
         <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <User className="h-4 w-4 text-muted-foreground"/>
         </div>
         <input id="reg-fname"required value={form.first_name} onChange={update('first_name')}
          className="block w-full rounded-xl border bg-white/60 backdrop-blur-sm py-3 pl-10 pr-4 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
          placeholder="John"/>
        </div>
       </div>
       <div className="space-y-1.5">
        <label className="text-sm font-medium"htmlFor="reg-lname">Last Name</label>
        <input id="reg-lname"required value={form.last_name} onChange={update('last_name')}
         className="block w-full rounded-xl border bg-white/60 backdrop-blur-sm py-3 px-4 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
         placeholder="Doe"/>
       </div>
      </div>

      <div className="space-y-1.5">
       <label className="text-sm font-medium"htmlFor="reg-email">Email Address</label>
       <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
         <Mail className="h-5 w-5 text-muted-foreground"/>
        </div>
        <input id="reg-email"type="email"required value={form.email} onChange={update('email')}
         className="block w-full rounded-xl border bg-white/60 backdrop-blur-sm py-3 pl-11 pr-4 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
         placeholder="you@example.com"/>
       </div>
      </div>

      <div className="space-y-1.5">
       <label className="text-sm font-medium"htmlFor="reg-pw">Password</label>
       <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
         <Lock className="h-5 w-5 text-muted-foreground"/>
        </div>
        <input id="reg-pw"type="password"required minLength={8} value={form.password} onChange={update('password')}
         className="block w-full rounded-xl border bg-white/60 backdrop-blur-sm py-3 pl-11 pr-4 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
         placeholder="••••••••"/>
       </div>
      </div>

      <div className="space-y-1.5">
       <label className="text-sm font-medium"htmlFor="reg-pw2">Confirm Password</label>
       <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
         <Lock className="h-5 w-5 text-muted-foreground"/>
        </div>
        <input id="reg-pw2"type="password"required value={form.password_confirm} onChange={update('password_confirm')}
         className="block w-full rounded-xl border bg-white/60 backdrop-blur-sm py-3 pl-11 pr-4 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
         placeholder="••••••••"/>
       </div>
      </div>

      <div className="relative mt-8 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-xl blur opacity-40 group-hover:opacity-80 transition duration-500 animate-pulse-soft"></div>
        <button type="submit" disabled={loading}
         className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-50 transition-all">
         {loading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"/>
         ) : (
          <>
           Create Account
           <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1"/>
          </>
         )}
        </button>
      </div>
     </form>

     <p className="mt-8 text-center text-sm text-muted-foreground">
      Already have an account?{' '}
      <Link to="/login"className="font-semibold text-primary hover:underline">
       Sign In
      </Link>
     </p>
    </div>
   </div>
  </div>
 )
}
