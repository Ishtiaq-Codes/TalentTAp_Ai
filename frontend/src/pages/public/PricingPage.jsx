import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  CheckCircle2, X, Zap, Building2, Phone, ArrowRight,
  Sparkles, Shield, Users, MessageSquare, Briefcase, Star
} from 'lucide-react'

import { useAuth } from '@/contexts/AuthContext'
import api from '@/api/client'
import { useToast } from '@/contexts/ToastContext'
import PublicNavbar from '@/components/layout/PublicNavbar'
import Footer from '@/components/layout/Footer'
import SEOHead from '@/components/shared/SEOHead'
import { cn } from '@/lib/utils'

const TIERS = [
  {
    id: 'tier-free',
    name: 'Starter',
    price: { monthly: '$0', annual: '$0' },
    description: 'For startups and small teams making their first hires.',
    icon: Building2,
    iconBg: 'bg-slate-100 text-slate-600',
    features: [
      '1 Active Job Posting',
      'Basic Candidate Search',
      'Single Recruiter Account',
      'Email Support',
    ],
    locked: [
      'AI Match Scores & Explainability',
      'Invite Team Members',
      'Direct Messaging',
      'Candidate Contact Details',
      'Auto-Headhunter',
    ],
    cta: 'Get Started Free',
    href: '/register?role=company_admin',
    featured: false,
  },
  {
    id: 'tier-pro',
    name: 'Pro',
    price: { monthly: '$49', annual: '$39' },
    priceSuffix: '/mo',
    description: 'Everything you need to scale hiring with full AI intelligence.',
    icon: Zap,
    iconBg: 'bg-violet-100 text-violet-600',
    badge: 'Most Popular',
    features: [
      'Up to 10 Active Job Postings',
      'AI Match Scores & Full Explainability',
      'Unlimited Recruiter Invites',
      'Direct Messaging with Candidates',
      'Full Candidate Contact Info',
      'Auto-Headhunter & AI Draft Outreach',
      'Talent Pool Management',
      'Priority Support',
    ],
    locked: [],
    cta: 'Upgrade to Pro',
    href: '#',
    featured: true,
  },
  {
    id: 'tier-enterprise',
    name: 'Enterprise',
    price: { monthly: 'Custom', annual: 'Custom' },
    description: 'Custom limits and dedicated support for high-volume hiring teams.',
    icon: Phone,
    iconBg: 'bg-amber-100 text-amber-600',
    features: [
      'Unlimited Job Postings',
      'Custom AI Prompt Tuning',
      'White-labeled Candidate Experience',
      'Dedicated Account Manager',
      'SLA & 24/7 Support',
      'Custom Integrations',
    ],
    locked: [],
    cta: 'Contact Sales',
    href: '/contact',
    featured: false,
  },
]

const FAQS = [
  { q: 'Is there a free trial for Pro?', a: "Yes — every new company account gets a 14-day Pro trial at no cost. No credit card required to start." },
  { q: 'Can I cancel anytime?', a: "Absolutely. You can cancel your subscription at any time from your billing settings. You'll retain Pro access until the end of your billing period." },
  { q: 'What counts as a recruiter seat?', a: "Every user you invite to your company workspace counts as a recruiter seat. Pro allows unlimited seats." },
  { q: 'How does AI matching work?', a: "Our AI analyzes job requirements against candidate profiles across skills, experience, location, employment type, and availability — producing a ranked score for each match with a detailed explanation." },
]

const SOCIAL_PROOF = [
  { quote: "TalentTap cut our time-to-hire from 6 weeks to under 2. The AI scoring is genuinely impressive.", name: "Sarah K.", role: "Head of Talent, Series B Startup" },
  { quote: "We replaced our entire ATS with TalentTap. It's faster, smarter, and the team loves it.", name: "Marcus T.", role: "CTO, Tech Agency" },
]

export default function PricingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { error: showErrorToast, info } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [billing, setBilling] = useState('monthly') // 'monthly' | 'annual'

  useEffect(() => {
    if (searchParams.get('cancel') === 'true') {
      showErrorToast('Checkout was canceled. No charge was made.')
      window.history.replaceState({}, '', '/pricing')
    }
  }, [searchParams, showErrorToast])

  const handleUpgrade = async (tier) => {
    if (tier.id === 'tier-enterprise') {
      navigate('/contact')
      return
    }
    if (tier.id === 'tier-free') {
      navigate(user ? '/company/dashboard' : '/register?role=company_admin')
      return
    }

    if (!user) {
      navigate('/login?redirect=/pricing')
      return
    }
    if (user.role === 'candidate') {
      info("Candidates get TalentTap completely free — no subscription needed!")
      return
    }

    setIsLoading(true)
    try {
      const res = await api.post('subscriptions/checkout/', {})
      if (res.data.url) window.location.href = res.data.url
    } catch (err) {
      showErrorToast(err.response?.data?.error || err.message || 'Unable to start checkout. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <SEOHead
        title="Pricing | TalentTap"
        description="Simple, transparent pricing for teams of all sizes. Start free, upgrade when you're ready."
      />
      <PublicNavbar />

      <main className="flex-grow">
        {/* ── Hero ── */}
        <section className="pt-32 pb-16 px-4 text-center relative overflow-hidden">
          {/* Background orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-violet-500/6 blur-[120px] pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 border border-violet-200 px-4 py-1.5 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-violet-500" />
              <span className="text-xs font-semibold text-violet-700">Simple, transparent pricing</span>
            </div>
            <h1 className="text-display font-black text-slate-900 mb-5">
              Pricing that scales<br />
              <span className="text-gradient-primary">with your team</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
              Start free. Upgrade when you need AI-powered hiring at scale. Cancel anytime — no contracts, no surprises.
            </p>

            {/* Billing toggle */}
            <div className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-slate-100 p-1">
              {['monthly', 'annual'].map((period) => (
                <button
                  key={period}
                  onClick={() => setBilling(period)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition-all',
                    billing === period
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {period === 'monthly' ? 'Monthly' : 'Annual'}
                  {period === 'annual' && (
                    <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      Save 20%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing Cards ── */}
        <section className="px-4 pb-20">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={cn(
                    'relative flex flex-col rounded-3xl overflow-hidden',
                    tier.featured
                      ? 'bg-gradient-to-b from-[hsl(224,60%,8%)] to-[hsl(263,50%,14%)] text-white shadow-2xl shadow-violet-900/30 ring-1 ring-violet-500/30 lg:-translate-y-4 lg:scale-[1.02]'
                      : 'bg-white border border-slate-200 shadow-sm'
                  )}
                >
                  {/* Popular badge */}
                  {tier.badge && (
                    <div className="absolute top-5 right-5 flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1">
                      <Star className="h-3 w-3 fill-amber-900 text-amber-900" />
                      <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">{tier.badge}</span>
                    </div>
                  )}

                  <div className="p-7 flex-1">
                    {/* Icon + name */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-2xl', tier.featured ? 'bg-violet-500/20 text-violet-400' : tier.iconBg)}>
                        <tier.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className={cn('text-lg font-bold', tier.featured ? 'text-white' : 'text-slate-900')}>
                          {tier.name}
                        </h3>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className={cn('text-4xl font-black', tier.featured ? 'text-white' : 'text-slate-900')}>
                          {tier.price[billing]}
                        </span>
                        {tier.price[billing] !== 'Custom' && tier.price[billing] !== '$0' && (
                          <span className={cn('text-sm', tier.featured ? 'text-slate-400' : 'text-slate-500')}>/mo</span>
                        )}
                      </div>
                      {billing === 'annual' && tier.price.monthly !== '$0' && tier.price.monthly !== 'Custom' && (
                        <p className={cn('text-xs mt-1', tier.featured ? 'text-slate-400' : 'text-slate-500')}>
                          Billed annually · {tier.price.monthly}/mo billed monthly
                        </p>
                      )}
                    </div>

                    <p className={cn('text-sm leading-relaxed mb-6', tier.featured ? 'text-slate-400' : 'text-slate-500')}>
                      {tier.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2.5">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <CheckCircle2 className={cn('h-4.5 w-4.5 flex-shrink-0 mt-0.5', tier.featured ? 'text-violet-400' : 'text-emerald-500')} style={{ height: '18px', width: '18px' }} />
                          <span className={cn('text-sm', tier.featured ? 'text-slate-300' : 'text-slate-700')}>{f}</span>
                        </li>
                      ))}
                      {tier.locked.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 opacity-40">
                          <X className="h-4.5 w-4.5 flex-shrink-0 mt-0.5 text-slate-400" style={{ height: '18px', width: '18px' }} />
                          <span className={cn('text-sm line-through', tier.featured ? 'text-slate-400' : 'text-slate-400')}>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="p-7 pt-0">
                    <button
                      onClick={() => handleUpgrade(tier)}
                      disabled={isLoading && tier.featured}
                      className={cn(
                        'w-full flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold transition-all',
                        tier.featured
                          ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 shadow-lg shadow-violet-500/30'
                          : tier.id === 'tier-enterprise'
                          ? 'bg-amber-400 text-amber-950 hover:bg-amber-500'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      )}
                    >
                      {isLoading && tier.featured ? (
                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      ) : (
                        <>
                          {tier.cta}
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                    {tier.featured && (
                      <p className="mt-3 text-center text-xs text-slate-500">14-day free trial · No credit card required</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Social Proof ── */}
        <section className="py-16 px-4 bg-slate-50 border-y border-slate-200">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {SOCIAL_PROOF.map(({ quote, name, role }) => (
                <div key={name} className="card-premium p-6">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed mb-4">"{quote}"</p>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{name}</p>
                    <p className="text-xs text-slate-500">{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 px-4">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {FAQS.map(({ q, a }) => (
                <div key={q} className="card-premium p-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{q}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>

            {/* Final CTA */}
            <div className="mt-12 text-center">
              <p className="text-slate-600 mb-4">Still have questions?</p>
              <Link to="/contact" className="btn btn-secondary">
                Talk to our team
              </Link>
            </div>
          </div>
        </section>

        {/* ── Trust Bar ── */}
        <section className="py-10 px-4 border-t border-slate-100">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-wrap items-center justify-center gap-8 text-slate-500 text-sm">
              {[
                { icon: Shield, text: 'SOC 2 Compliant' },
                { icon: Zap, text: 'Stripe Secured Payments' },
                { icon: Users, text: 'GDPR Ready' },
                { icon: MessageSquare, text: 'Priority Support' },
                { icon: Briefcase, text: 'Cancel Anytime' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-violet-500" />
                  <span className="text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
