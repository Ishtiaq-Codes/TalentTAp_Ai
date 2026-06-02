import { useState } from 'react'
import { Save, Bell, Shield, CreditCard } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('notifications')
  const comingSoon = () => alert('This functionality is coming soon in Phase 5!')

  const [prefs, setPrefs] = useState({ newApps: true, aiMatch: true, messages: true })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 1000)
  }

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Company Settings</h1>
        <p className="text-muted-foreground">Manage your preferences, billing, and security.</p>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 rounded-xl border bg-card p-6">
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold border-b pb-4">Email Notifications</h2>
              
              <div className="space-y-4">
                {[
                  { id: 'newApps', title: 'New Applications', desc: 'Receive an email when a candidate applies.' },
                  { id: 'aiMatch', title: 'AI Match Alerts', desc: 'Get notified when the AI finds a 90%+ match.' },
                  { id: 'messages', title: 'Messages', desc: 'Receive an email when a candidate messages you.' }
                ].map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input 
                        type="checkbox" 
                        className="peer sr-only" 
                        checked={prefs[item.id]} 
                        onChange={() => setPrefs({...prefs, [item.id]: !prefs[item.id]})}
                      />
                      <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Preferences'}
                </button>
                {saved && <span className="text-sm text-emerald-600 font-medium">Preferences saved successfully!</span>}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold border-b pb-4">Security Settings</h2>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">To change your password, please go to the auth settings or use the forgot password flow.</p>
                <button onClick={comingSoon} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
                  Enable Two-Factor Authentication
                </button>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold border-b pb-4">Billing & Plan</h2>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-primary">Pro Plan</h3>
                    <p className="text-sm mt-1 text-muted-foreground">Unlimited active jobs, premium AI matching.</p>
                  </div>
                  <span className="text-sm font-medium bg-primary/20 text-primary px-2 py-1 rounded">Active</span>
                </div>
              </div>
              <button onClick={comingSoon} className="text-sm text-primary hover:underline font-medium">Manage Billing via Stripe</button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
