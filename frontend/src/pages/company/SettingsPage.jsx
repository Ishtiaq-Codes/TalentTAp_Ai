import { useState, useEffect } from 'react'
import { Save, Bell, Shield, CreditCard, CheckCircle, Loader2, User, Upload } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { authAPI } from '@/api/auth'
import { useToast } from '@/contexts/ToastContext'

export default function SettingsPage() {
  const { user: authUser, fetchUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const { info, success, error } = useToast()

  const [prefs, setPrefs] = useState({ 
    newApps: authUser?.notify_new_apps ?? true, 
    aiMatch: authUser?.notify_ai_match ?? true, 
    messages: authUser?.notify_messages ?? true 
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (authUser) {
      setPrefs({
        newApps: authUser.notify_new_apps ?? true,
        aiMatch: authUser.notify_ai_match ?? true,
        messages: authUser.notify_messages ?? true,
      })
    }
  }, [authUser])

  const [uiState, setUiState] = useState({
    mfaEnabling: false,
    mfaEnabled: false,
    portalLoading: false
  })

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await authAPI.updateMe({
        notify_new_apps: prefs.newApps,
        notify_ai_match: prefs.aiMatch,
        notify_messages: prefs.messages
      })
      await fetchUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const handleMFA = () => {
    setUiState(s => ({ ...s, mfaEnabling: true }))
    setTimeout(() => {
      setUiState(s => ({ ...s, mfaEnabling: false, mfaEnabled: !s.mfaEnabled }))
    }, 1000)
  }

  const handleBilling = () => {
    setUiState(s => ({ ...s, portalLoading: true }))
    setTimeout(() => {
      setUiState(s => ({ ...s, portalLoading: false }))
      info('Billing portal integration is part of the upcoming Phase 5.')
    }, 800)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ]

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      await authAPI.uploadAvatar(file)
      // Update context so header shows new avatar
      await fetchUser()
      success('Avatar uploaded successfully!')
    } catch {
      error('Error uploading avatar')
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground max-w-xl">
          Manage your account preferences, security settings, and billing information.
        </p>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1">
          {activeTab === 'profile' && (
            <div className="animate-fade-in-up rounded-2xl border bg-white shadow-sm overflow-hidden">
              <div className="border-b bg-slate-50/50 px-6 py-5">
                <h2 className="text-lg font-bold">Personal Profile</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage your personal information and avatar.</p>
              </div>

              <div className="p-6 space-y-8">
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-slate-900">Profile Picture</label>
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-slate-100 shadow-sm shrink-0">
                      {authUser?.avatar ? (
                        <img src={authUser.avatar} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xl font-bold text-primary">
                          {authUser?.first_name?.[0]}{authUser?.last_name?.[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors">
                        <Upload className="h-4 w-4" /> Upload New Photo
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                      </label>
                      <p className="mt-2 text-xs text-muted-foreground">Recommended: Square image, at least 400x400px.</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-8 grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-900">First Name</label>
                    <input type="text" disabled value={authUser?.first_name || ''} className="mt-2 block w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-sm text-slate-500" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-900">Last Name</label>
                    <input type="text" disabled value={authUser?.last_name || ''} className="mt-2 block w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-sm text-slate-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-900">Email Address</label>
                    <input type="email" disabled value={authUser?.email || ''} className="mt-2 block w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-sm text-slate-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="animate-fade-in-up rounded-2xl border bg-white shadow-sm overflow-hidden">
              <div className="border-b bg-slate-50/50 px-6 py-5">
                <h2 className="text-lg font-bold">Email Notifications</h2>
                <p className="text-sm text-muted-foreground mt-1">Control which alerts are sent to your inbox.</p>
              </div>

              <div className="p-6 space-y-6">
                {[
                  { id: 'newApps', title: 'New Applications', desc: 'Receive an email when a candidate applies to your job.' },
                  { id: 'aiMatch', title: 'AI Match Alerts', desc: 'Get notified when the AI finds a 90%+ match.' },
                  { id: 'messages', title: 'Messages', desc: 'Receive an email when a candidate messages you.' }
                ].map((item, idx) => (
                  <div key={item.id} className={`flex items-center justify-between ${idx !== 0 ? 'border-t pt-6' : ''}`}>
                    <div className="pr-4">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center shrink-0">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={prefs[item.id]}
                        onChange={() => setPrefs({ ...prefs, [item.id]: !prefs[item.id] })}
                      />
                      <div className="peer h-7 w-12 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-6 after:w-6 after:rounded-full after:border after:border-white after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 shadow-inner"></div>
                    </label>
                  </div>
                ))}

                <div className="pt-6 border-t flex items-center gap-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center justify-center min-w-[140px] gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary/90 disabled:opacity-50 transition-all"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>

                  {saved && (
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 animate-fade-in">
                      <CheckCircle className="h-4 w-4" /> Preferences saved
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-fade-in-up rounded-2xl border bg-white shadow-sm overflow-hidden">
              <div className="border-b bg-slate-50/50 px-6 py-5">
                <h2 className="text-lg font-bold">Security Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage your account security and authentication methods.</p>
              </div>

              <div className="p-6 space-y-8">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Two-Factor Authentication (2FA)</h3>
                  <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account by requiring a code from your mobile device upon login.</p>

                  <button
                    onClick={handleMFA}
                    disabled={uiState.mfaEnabling}
                    className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${uiState.mfaEnabled
                        ? 'border-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                        : 'border-2 border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary'
                      }`}
                  >
                    {uiState.mfaEnabling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                    {uiState.mfaEnabled ? 'Disable 2FA' : 'Enable 2FA via Authenticator'}
                  </button>
                </div>

                <div className="border-t pt-8">
                  <h3 className="font-semibold text-slate-900 mb-2">Password</h3>
                  <p className="text-sm text-muted-foreground mb-4">To change your password, please use the secure password reset flow.</p>
                  <button
                    onClick={() => window.location.href = '/forgot-password'}
                    className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="animate-fade-in-up rounded-2xl border bg-white shadow-sm overflow-hidden">
              <div className="border-b bg-slate-50/50 px-6 py-5">
                <h2 className="text-lg font-bold">Billing & Plan</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage your subscription, payment methods, and billing history.</p>
              </div>

              <div className="p-6 space-y-8">
                <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-50 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                    <CreditCard className="h-32 w-32 -mt-8 -mr-8" />
                  </div>

                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">Pro Plan</h3>
                        <span className="inline-flex items-center rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">Active</span>
                      </div>
                      <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                        Unlimited active jobs, premium AI matching, and advanced candidate filtering.
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-3xl font-bold tracking-tight text-slate-900">$49<span className="text-lg text-muted-foreground font-medium">/mo</span></p>
                      <p className="text-xs text-muted-foreground mt-1">Renews on July 1, 2025</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleBilling}
                    disabled={uiState.portalLoading}
                    className="inline-flex items-center justify-center min-w-[200px] gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-slate-800 disabled:opacity-50 transition-all"
                  >
                    {uiState.portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Manage via Stripe'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
