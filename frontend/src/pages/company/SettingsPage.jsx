import { useState, useEffect } from 'react'
import { Save, Bell, Shield, CreditCard, CheckCircle, Loader2, User, Upload, KeyRound } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '@/contexts/AuthContext'
import { authAPI } from '@/api/auth'
import { companiesAPI } from '@/api/companies'
import { useToast } from '@/contexts/ToastContext'
import ConfirmModal from '@/components/common/ConfirmModal'

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

  const [profileData, setProfileData] = useState({ first_name: '', last_name: '' })
  const [recruiterData, setRecruiterData] = useState({ title: '', department: '', phone_number: '', linkedin_url: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  useEffect(() => {
    if (authUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrefs({
        newApps: authUser.notify_new_apps ?? true,
        aiMatch: authUser.notify_ai_match ?? true,
        messages: authUser.notify_messages ?? true,
      })
      setProfileData({
        first_name: authUser.first_name || '',
        last_name: authUser.last_name || ''
      })
      // Fetch recruiter profile
      companiesAPI.getMyRecruiterProfile().then(res => {
        if (res.data) {
          setRecruiterData({
            title: res.data.title || '',
            department: res.data.department || '',
            phone_number: res.data.phone_number || '',
            linkedin_url: res.data.linkedin_url || ''
          })
        }
      }).catch(err => console.error(err))
    }
  }, [authUser])

  const [uiState, setUiState] = useState({
    portalLoading: false
  })

  // MFA State
  const [mfaEnabling, setMfaEnabling] = useState(false)
  const [mfaSetupData, setMfaSetupData] = useState(null)
  const [mfaCode, setMfaCode] = useState('')
  const [mfaError, setMfaError] = useState('')
  const [showDisableMfaConfirm, setShowDisableMfaConfirm] = useState(false)

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
    } catch {
      error('Failed to update preferences.')
    } finally {
      setSaving(false)
    }
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await authAPI.updateMe({
        first_name: profileData.first_name,
        last_name: profileData.last_name
      })
      await companiesAPI.updateMyRecruiterProfile({
        title: recruiterData.title,
        department: recruiterData.department,
        phone_number: recruiterData.phone_number,
        linkedin_url: recruiterData.linkedin_url
      })
      await fetchUser()
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 3000)
      success('Profile updated successfully!')
    } catch {
      error('Failed to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleEnableMFA = async () => {
    setMfaEnabling(true)
    setMfaError('')
    try {
      const res = await authAPI.setupMFA()
      setMfaSetupData(res.data)
    } catch {
      setMfaError('Failed to initiate MFA setup')
    } finally {
      setMfaEnabling(false)
    }
  }

  const handleVerifyMFA = async () => {
    if (!mfaCode || mfaCode.length !== 6) {
      setMfaError('Code must be 6 digits')
      return
    }
    setMfaEnabling(true)
    setMfaError('')
    try {
      await authAPI.verifyMFA(mfaCode)
      await fetchUser() // updates mfa_enabled on user
      setMfaSetupData(null)
      setMfaCode('')
      success('2FA enabled successfully!')
    } catch {
      setMfaError('Invalid code. Try again.')
    } finally {
      setMfaEnabling(false)
    }
  }

  const handleDisableMFA = async () => {
    setMfaEnabling(true)
    try {
      await authAPI.disableMFA()
      await fetchUser()
      success('2FA disabled.')
    } catch {
      error('Failed to disable MFA')
    } finally {
      setMfaEnabling(false)
    }
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
                    <input 
                      type="text" 
                      value={profileData.first_name} 
                      onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                      className="mt-2 block w-full rounded-lg border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-900">Last Name</label>
                    <input 
                      type="text" 
                      value={profileData.last_name} 
                      onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                      className="mt-2 block w-full rounded-lg border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-900">Email Address <span className="text-xs font-normal text-slate-400">(cannot be changed)</span></label>
                    <input type="email" disabled value={authUser?.email || ''} className="mt-2 block w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-900">Job Title</label>
                    <input 
                      type="text" 
                      value={recruiterData.title} 
                      onChange={(e) => setRecruiterData({ ...recruiterData, title: e.target.value })}
                      className="mt-2 block w-full rounded-lg border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" 
                      placeholder="e.g. Senior Recruiter"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-900">Department</label>
                    <input 
                      type="text" 
                      value={recruiterData.department} 
                      onChange={(e) => setRecruiterData({ ...recruiterData, department: e.target.value })}
                      className="mt-2 block w-full rounded-lg border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" 
                      placeholder="e.g. Human Resources"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-900">Phone Number</label>
                    <input 
                      type="text" 
                      value={recruiterData.phone_number} 
                      onChange={(e) => setRecruiterData({ ...recruiterData, phone_number: e.target.value })}
                      className="mt-2 block w-full rounded-lg border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" 
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-900">LinkedIn URL</label>
                    <input 
                      type="url" 
                      value={recruiterData.linkedin_url} 
                      onChange={(e) => setRecruiterData({ ...recruiterData, linkedin_url: e.target.value })}
                      className="mt-2 block w-full rounded-lg border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" 
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </div>

                <div className="pt-6 border-t flex items-center gap-4">
                  <button
                    onClick={handleProfileSave}
                    disabled={savingProfile}
                    className="inline-flex items-center justify-center min-w-[140px] gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary/90 disabled:opacity-50 transition-all"
                  >
                    {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {savingProfile ? 'Saving...' : 'Save Profile'}
                  </button>

                  {profileSaved && (
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 animate-fade-in">
                      <CheckCircle className="h-4 w-4" /> Profile saved
                    </div>
                  )}
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

                  {authUser?.mfa_enabled ? (
                    <button
                      onClick={() => setShowDisableMfaConfirm(true)}
                      disabled={mfaEnabling}
                      className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all border-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      {mfaEnabling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                      Disable 2FA
                    </button>
                  ) : !mfaSetupData ? (
                    <button
                      onClick={handleEnableMFA}
                      disabled={mfaEnabling}
                      className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all border-2 border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary"
                    >
                      {mfaEnabling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                      Enable 2FA via Authenticator
                    </button>
                  ) : (
                    <div className="mt-4 animate-fade-in-up rounded-xl border bg-slate-50 p-6">
                      <h4 className="font-semibold text-slate-900 mb-2">Configure Authenticator App</h4>
                      <p className="text-sm text-slate-500 mb-6">Scan the QR code below using your authenticator app (e.g., Google Authenticator, Authy).</p>
                      
                      <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="bg-white p-4 rounded-xl shadow-sm border inline-block">
                          <QRCodeSVG value={mfaSetupData.uri} size={160} />
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          <div>
                            <label className="text-xs font-bold uppercase text-slate-400">Manual Setup Key</label>
                            <div className="mt-1 flex items-center gap-2 bg-white px-3 py-2 border rounded-lg">
                              <KeyRound className="h-4 w-4 text-slate-400" />
                              <code className="text-sm font-mono tracking-widest text-slate-700">{mfaSetupData.secret}</code>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-xs font-bold uppercase text-slate-400">Enter 6-digit Code</label>
                            <div className="mt-1 flex items-center gap-3">
                              <input 
                                type="text"
                                maxLength={6}
                                value={mfaCode}
                                onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="w-32 text-center tracking-widest font-mono text-lg rounded-lg border px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                              />
                              <button 
                                onClick={handleVerifyMFA}
                                disabled={mfaEnabling || mfaCode.length !== 6}
                                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:opacity-50 transition-colors"
                              >
                                {mfaEnabling ? 'Verifying...' : 'Verify & Enable'}
                              </button>
                              <button 
                                onClick={() => { setMfaSetupData(null); setMfaCode(''); setMfaError(''); }}
                                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
                              >
                                Cancel
                              </button>
                            </div>
                            {mfaError && <p className="mt-2 text-sm text-red-500 font-medium">{mfaError}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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

      <ConfirmModal
        isOpen={showDisableMfaConfirm}
        onClose={() => setShowDisableMfaConfirm(false)}
        onConfirm={handleDisableMFA}
        title="Disable 2FA"
        message="Are you sure you want to disable Two-Factor Authentication? This will make your account less secure."
        confirmText="Disable 2FA"
        isDestructive={true}
      />
    </div>
  )
}
