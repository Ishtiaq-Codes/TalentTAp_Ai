import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Sparkles, Zap, Users, MessageSquare, Check, ArrowRight } from 'lucide-react'
import api from '@/api/client'
import { useToast } from '@/contexts/ToastContext'

const PRO_FEATURES = [
  {
    icon: Sparkles,
    color: 'text-violet-600 bg-violet-100',
    title: 'AI Match Scoring & Explainability',
    desc: 'See exactly why a candidate matches — with detailed skill, experience & location breakdowns.',
  },
  {
    icon: Users,
    color: 'text-blue-600 bg-blue-100',
    title: 'Unlimited Team Members',
    desc: 'Invite your entire recruiting team and collaborate with shared candidate pipelines.',
  },
  {
    icon: MessageSquare,
    color: 'text-amber-600 bg-amber-100',
    title: 'Direct Messaging & Full Contact',
    desc: 'Message candidates instantly and unlock emails, phone numbers, and portfolio links.',
  },
  {
    icon: Zap,
    color: 'text-emerald-600 bg-emerald-100',
    title: 'Auto-Headhunter & AI Drafts',
    desc: 'Let AI automatically reach out to top candidates and draft personalized outreach emails.',
  },
]

export default function UpgradeModal({ isOpen, onClose, featureName }) {
  const [isLoading, setIsLoading] = useState(false)
  const { error } = useToast()

  if (!isOpen) return null

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      const res = await api.post('subscriptions/checkout/', {})
      if (res.data.url) {
        window.location.href = res.data.url
      }
    } catch (err) {
      error(err.response?.data?.error || err.message || 'Unable to start checkout. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(8, 12, 30, 0.65)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero gradient header */}
        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-8 pt-8 pb-10">
          {/* Decorative blur circles */}
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-blue-400/20 blur-2xl" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 px-3 py-1 mb-4">
              <Zap className="h-3 w-3 text-amber-300" />
              <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">Pro Plan</span>
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight">
              {featureName
                ? <>Unlock <span className="text-amber-300">{featureName}</span></>
                : 'Unlock TalentTap Pro'
              }
            </h2>
            <p className="mt-2 text-sm text-white/70 leading-relaxed">
              Scale your hiring with AI-powered insights, unlimited team collaboration, and full candidate access.
            </p>

            {/* Price */}
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">$49</span>
              <span className="text-white/60 text-sm">/month</span>
              <span className="ml-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 text-xs font-bold text-emerald-300">
                14-day free trial
              </span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="px-6 py-5">
          <div className="space-y-3.5">
            {PRO_FEATURES.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl mt-0.5 ${color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 leading-tight">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-6 space-y-2">
            <button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 hover:scale-[1.02] disabled:opacity-60 disabled:scale-100 transition-all"
            >
              {isLoading ? (
                <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Starting checkout...</>
              ) : (
                <><ArrowRight className="h-4 w-4" /> Start Free Trial</>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              Maybe later
            </button>
          </div>

          {/* Trust line */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
            {['No credit card required', 'Cancel anytime', 'Instant access'].map((t) => (
              <span key={t} className="flex items-center gap-1">
                <Check className="h-3 w-3 text-emerald-500" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
