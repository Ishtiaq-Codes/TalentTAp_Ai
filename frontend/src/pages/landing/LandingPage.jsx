import { useState, useEffect, useRef } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth, getDashboardPath } from '@/contexts/AuthContext'
import PublicNavbar from '@/components/layout/PublicNavbar'
import Footer from '@/components/layout/Footer'
import {
  Sparkles, ArrowRight, Users, Briefcase, Brain, CheckCircle,
  Zap, Shield, Globe, Search, Target, BarChart3, ChevronDown,
  Star, Quote, UserCheck, Building2, TrendingUp, ArrowUpRight,
} from 'lucide-react'

/* ─── Animated counter hook ─── */
function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    let start = 0
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [started, end, duration])

  return { count, ref }
}

/* ─── Scroll reveal hook ─── */
function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return { ref, visible }
}

/* ─── Data ─── */
const stats = [
  { value: 10000, suffix: '+', label: 'Active Candidates' },
  { value: 500, suffix: '+', label: 'Companies Hiring' },
  { value: 2000, suffix: '+', label: 'Jobs Posted' },
  { value: 89, suffix: '%', label: 'Match Accuracy' },
]

const features = [
  { icon: Brain, title: 'AI-Powered Matching', desc: 'Multi-dimensional scoring across skills, experience, location, availability, and job type.' },
  { icon: Search, title: 'Smart Candidate Discovery', desc: 'Search and filter talent by skills, location, experience level, and availability in real-time.' },
  { icon: BarChart3, title: 'Recruiter Dashboard', desc: 'Track jobs, applications, matches, and hiring pipeline from a single command center.' },
  { icon: Target, title: 'Talent Pools', desc: 'Build and manage curated shortlists of top candidates for current and future roles.' },
  { icon: Zap, title: 'Skill-Based Search', desc: 'Find candidates by exact skill match — no keyword guessing, no wasted time.' },
  { icon: Globe, title: 'Global Hiring', desc: 'Connect with remote-first talent worldwide. No borders, no limits.' },
]

const candidateBenefits = [
  'Create your professional profile once',
  'Get automatically discovered by top companies',
  'Showcase skills, experience, and portfolio',
  'Real-time visibility into your match scores',
  'Direct messaging with hiring managers',
  'No more submitting hundreds of applications',
]

const recruiterBenefits = [
  'AI-ranked candidate recommendations for every job',
  'Search talent by skills, location, and availability',
  'One-click shortlisting and messaging',
  'Detailed match breakdowns — no black box',
  'Application tracking and hiring pipeline',
  'Build talent pools for future hiring needs',
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Engineering Lead',
    company: 'TechVault Inc',
    quote: 'TalentTap cut our time-to-hire by 60%. The AI matching is scary accurate — we found our senior engineer in 3 days.',
    avatar: 'SC',
  },
  {
    name: 'David Martinez',
    role: 'Full-Stack Developer',
    company: 'Hired via TalentTap',
    quote: 'I created my profile on a Sunday and had 4 interview requests by Wednesday. Game changer for passive job seekers.',
    avatar: 'DM',
  },
  {
    name: 'Emily Roberts',
    role: 'VP of People',
    company: 'DataFlow Labs',
    quote: 'The quality of candidates is outstanding. Every shortlist feels hand-picked, but it\'s the AI doing the heavy lifting.',
    avatar: 'ER',
  },
]

const faqs = [
  {
    q: 'How does the AI matching work?',
    a: 'Our engine scores every candidate-job pair across 5 dimensions: skills match, experience level, location compatibility, availability, and employment type. Each dimension produces a 0-100 score, which are combined into an overall match percentage.',
  },
  {
    q: 'Is TalentTap free for candidates?',
    a: 'Yes! Candidates can create a profile, get matched to jobs, and receive messages from recruiters completely free. There are no hidden fees or premium tiers for job seekers.',
  },
  {
    q: 'How is this different from LinkedIn or Indeed?',
    a: 'Unlike traditional job boards where candidates apply and wait, TalentTap inverts the model — candidates create profiles and companies discover them. Our AI proactively matches talent to roles based on deep skill and experience analysis.',
  },
  {
    q: 'Can I use TalentTap for remote hiring?',
    a: 'Absolutely. You can filter candidates by remote, hybrid, or on-site preferences, and our matching engine accounts for location and time zone compatibility.',
  },
  {
    q: 'How quickly can I start receiving matches?',
    a: 'Matches are generated instantly when a job is posted. As soon as a recruiter creates a job listing, our AI analyzes all available candidate profiles and delivers ranked recommendations within seconds.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. We use industry-standard encryption for all data in transit and at rest. Contact information is only visible to authenticated recruiters — public visitors can see your skills and experience but not your email or phone.',
  },
]

/* ─── FAQ Item ─── */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-base font-medium text-foreground pr-4">{q}</span>
        <ChevronDown className={`h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-sm leading-relaxed text-muted-foreground">{a}</p>
      </div>
    </div>
  )
}

/* ─── Stat Card ─── */
function StatCounter({ value, suffix, label }) {
  const { count, ref } = useCountUp(value)
  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl font-bold text-primary sm:text-5xl">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  )
}

/* ═══════════════════════════════════════════ */
/* ─── Main Component ─── */
/* ═══════════════════════════════════════════ */

export default function LandingPage() {
  const { user, loading } = useAuth()
  const heroReveal = useReveal()
  const problemReveal = useReveal()
  const candidateReveal = useReveal()
  const recruiterReveal = useReveal()
  const showcaseReveal = useReveal()

  if (!loading && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* ── 1. HERO ── */}
      <section className="relative overflow-hidden pt-16">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-400/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/3 to-transparent blur-3xl" />
        </div>

        <div ref={heroReveal.ref} className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className={`mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary transition-all duration-700 ${heroReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Sparkles className="h-4 w-4" />
              AI-Powered Talent Marketplace
            </div>

            {/* Headline */}
            <h1 className={`text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl transition-all duration-700 delay-100 ${heroReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Stop Applying.{' '}
              <span className="bg-gradient-to-r from-primary via-blue-600 to-blue-800 bg-clip-text text-transparent">
                Start Getting Discovered.
              </span>
            </h1>

            {/* Subheadline */}
            <p className={`mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl transition-all duration-700 delay-200 ${heroReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              TalentTap AI matches candidates with the right companies automatically
              — no more endless applications, no more filtering thousands of resumes.
            </p>

            {/* CTAs */}
            <div className={`mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row transition-all duration-700 delay-300 ${heroReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                Start Hiring
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                I'm a Candidate
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
              </Link>
            </div>
          </div>

          {/* Hero visual — mock dashboard */}
          <div className={`mx-auto mt-16 max-w-5xl transition-all duration-1000 delay-500 ${heroReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="rounded-2xl border border-slate-200/60 bg-white p-2 shadow-2xl shadow-slate-200/50">
              <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-6 sm:p-8">
                {/* Mock dashboard header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="h-3 w-32 rounded-full bg-slate-300"></div>
                    <div className="mt-2 h-2 w-48 rounded-full bg-slate-200"></div>
                  </div>
                  <div className="h-8 w-24 rounded-full bg-primary/20"></div>
                </div>
                {/* Mock stat cards */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {['bg-blue-50', 'bg-emerald-50', 'bg-amber-50', 'bg-purple-50'].map((bg, i) => (
                    <div key={i} className={`${bg} rounded-xl p-4`}>
                      <div className="h-2 w-8 rounded-full bg-slate-300 mb-2"></div>
                      <div className="h-5 w-12 rounded bg-slate-400/30"></div>
                    </div>
                  ))}
                </div>
                {/* Mock candidate rows */}
                <div className="space-y-2">
                  {[92, 87, 78].map((score, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-lg bg-white p-3 shadow-sm">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-blue-200"></div>
                      <div className="flex-1">
                        <div className="h-2.5 w-28 rounded-full bg-slate-300"></div>
                        <div className="mt-1.5 h-2 w-40 rounded-full bg-slate-200"></div>
                      </div>
                      <div className={`rounded-full px-3 py-1 text-xs font-bold ${score >= 90 ? 'bg-emerald-100 text-emerald-700' : score >= 80 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {score}% match
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TRUST BAR ── */}
      <section className="border-y bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-16 sm:grid-cols-4 sm:px-6">
          {stats.map((s) => (
            <StatCounter key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* ── 3. PROBLEM SECTION ── */}
      <section className="py-20 sm:py-28">
        <div ref={problemReveal.ref} className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className={`grid items-center gap-12 lg:grid-cols-2 transition-all duration-700 ${problemReveal.visible ? 'opacity-100' : 'opacity-0'}`}>
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">The Problem</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Traditional hiring is broken.
              </h2>
              <div className="mt-8 space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">For Candidates</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Submit hundreds of applications, customize each resume, wait weeks for a response that never comes.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">For Recruiters</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Spend hours filtering through unqualified applicants, scheduling screens, and still missing great candidates.</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-3 rounded-xl bg-primary/5 p-4">
                <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
                <p className="text-sm font-medium text-primary">TalentTap AI solves this by inverting the model — candidates get discovered, recruiters get recommendations.</p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="rounded-2xl bg-gradient-to-br from-red-50 to-amber-50 p-8">
                  <div className="space-y-4">
                    {['Resume sent...', 'Resume sent...', 'Resume sent...', 'No response', 'No response', 'Rejected'].map((text, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg bg-white/80 px-4 py-2.5 text-sm text-slate-500">
                        <div className={`h-2 w-2 rounded-full ${i < 3 ? 'bg-amber-400' : i < 5 ? 'bg-red-300' : 'bg-red-500'}`} />
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 rounded-xl bg-white p-3 shadow-lg border">
                  <p className="text-xs font-medium text-red-600">Avg. response rate: 2%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">How It Works</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Three steps. Zero hassle.</h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { step: '01', icon: UserCheck, title: 'Create Your Profile', desc: 'Candidates add skills, experience, and preferences. Recruiters post their open roles.' },
              { step: '02', icon: Brain, title: 'AI Finds Matches', desc: 'Our engine scores every candidate-job pair across 5 dimensions and ranks them in real-time.' },
              { step: '03', icon: Zap, title: 'Connect & Hire', desc: 'Review detailed match breakdowns, shortlist top talent, and start conversations directly.' },
            ].map(({ step, icon: Icon, title, desc }, i) => (
              <div key={step} className="group relative rounded-2xl border bg-white p-8 transition-all hover:shadow-lg hover:border-primary/20 hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl font-bold text-primary/10 group-hover:text-primary/20 transition-colors">{step}</span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                {i < 2 && (
                  <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 md:block">
                    <ArrowRight className="h-5 w-5 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. FEATURES ── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Features</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Everything you need for modern hiring</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">A complete platform built from the ground up to make talent discovery effortless.</p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group rounded-2xl border bg-white p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-blue-100 text-primary transition-all group-hover:shadow-md group-hover:shadow-primary/10">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. FOR CANDIDATES ── */}
      <section className="bg-white py-20 sm:py-28">
        <div ref={candidateReveal.ref} className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className={`grid items-center gap-12 lg:grid-cols-2 transition-all duration-700 ${candidateReveal.visible ? 'opacity-100' : 'opacity-0'}`}>
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-emerald-600">For Candidates</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Build your profile once.{' '}
                <span className="text-primary">Get discovered.</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                No more submitting hundreds of applications into the void. Create your professional profile and let top companies come to you.
              </p>
              <ul className="mt-8 space-y-3">
                {candidateBenefits.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/25 hover:bg-primary/90 transition-all"
              >
                Create Free Profile <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-sm rounded-2xl border bg-gradient-to-br from-emerald-50 to-blue-50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/30 to-emerald-200"></div>
                  <div>
                    <div className="h-3 w-24 rounded-full bg-slate-300"></div>
                    <div className="mt-1.5 h-2 w-32 rounded-full bg-slate-200"></div>
                  </div>
                </div>
                <div className="space-y-3 mt-4">
                  <div className="flex gap-2">
                    {['React', 'Python', 'AWS'].map(s => (
                      <span key={s} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{s}</span>
                    ))}
                  </div>
                  <div className="rounded-xl bg-white p-3 shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">Match Score</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full w-[92%] bg-gradient-to-r from-primary to-emerald-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">92%</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-emerald-500/10 p-3">
                    <p className="text-xs font-medium text-emerald-700">🎯 3 new companies interested in your profile</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. FOR RECRUITERS ── */}
      <section className="py-20 sm:py-28">
        <div ref={recruiterReveal.ref} className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className={`grid items-center gap-12 lg:grid-cols-2 transition-all duration-700 ${recruiterReveal.visible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="order-2 lg:order-1 flex justify-center">
              <div className="w-full max-w-sm rounded-2xl border bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-3 w-28 rounded-full bg-slate-300"></div>
                  <div className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">LIVE</div>
                </div>
                {[
                  { name: 'Alice Johnson', score: 95, skill: 'Full-Stack' },
                  { name: 'Bob Williams', score: 88, skill: 'Backend' },
                  { name: 'Carol Davis', score: 82, skill: 'Frontend' },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-white p-3 mb-2 shadow-sm">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-blue-200 flex items-center justify-center text-[10px] font-bold text-primary">
                      {c.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">{c.skill}</p>
                    </div>
                    <span className={`text-xs font-bold ${c.score >= 90 ? 'text-emerald-600' : 'text-primary'}`}>{c.score}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">For Recruiters</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Find the perfect candidate in{' '}
                <span className="text-primary">seconds, not weeks.</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Stop sifting through hundreds of irrelevant applications. Let AI surface the candidates who actually match your requirements.
              </p>
              <ul className="mt-8 space-y-3">
                {recruiterBenefits.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/25 hover:bg-primary/90 transition-all"
              >
                Start Hiring Free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. PLATFORM SHOWCASE ── */}
      <section ref={showcaseReveal.ref} className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Platform Preview</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Built for modern hiring teams</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            A clean, powerful interface that puts everything you need at your fingertips.
          </p>
          <div className={`mx-auto mt-12 max-w-5xl transition-all duration-1000 ${showcaseReveal.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="rounded-2xl border-2 border-slate-200/60 bg-gradient-to-b from-slate-50 to-white p-3 shadow-xl">
              <div className="rounded-xl bg-slate-100 p-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 space-y-3">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`rounded-lg p-3 ${i === 1 ? 'bg-primary/10 border border-primary/20' : 'bg-white'}`}>
                        <div className="h-2 w-16 rounded-full bg-slate-300"></div>
                      </div>
                    ))}
                  </div>
                  <div className="col-span-2 rounded-xl bg-white p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-3 w-32 rounded-full bg-slate-300"></div>
                      <div className="h-8 w-20 rounded-full bg-primary/20"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {['bg-blue-50', 'bg-emerald-50', 'bg-violet-50'].map((bg, i) => (
                        <div key={i} className={`${bg} rounded-lg p-3`}>
                          <div className="h-2 w-8 rounded-full bg-slate-300 mb-1.5"></div>
                          <div className="h-4 w-10 rounded bg-slate-400/20"></div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                          <div className="h-8 w-8 rounded-full bg-slate-200"></div>
                          <div className="flex-1"><div className="h-2 w-20 rounded-full bg-slate-300"></div></div>
                          <div className="h-5 w-12 rounded-full bg-emerald-100"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. TESTIMONIALS ── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Testimonials</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Loved by teams and talent</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map(({ name, role, company, quote, avatar }) => (
              <div key={name} className="rounded-2xl border bg-white p-6 transition-all hover:shadow-lg">
                <Quote className="h-8 w-8 text-primary/20 mb-4" />
                <p className="text-sm leading-relaxed text-muted-foreground italic">"{quote}"</p>
                <div className="mt-6 flex items-center gap-3 border-t pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-blue-200 text-xs font-bold text-primary">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground">{role} at {company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. FAQ ── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">FAQ</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked questions</h2>
          </div>
          <div className="mt-12">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} {...faq} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. CTA ── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-16 text-center sm:px-16 sm:py-20">
            {/* Background decoration */}
            <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to transform your hiring?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
                Join thousands of companies and candidates using AI to make better hiring decisions, faster.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-slate-900 shadow-lg hover:bg-slate-100 transition-all"
                >
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-600 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-all"
                >
                  Request a Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 12. FOOTER ── */}
      <Footer />
    </div>
  )
}
