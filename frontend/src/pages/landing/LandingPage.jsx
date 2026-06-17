/* eslint-disable react-hooks/refs */
import { useState, useEffect, useRef } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth, getDashboardPath } from '@/contexts/AuthContext'
import PublicNavbar from '@/components/layout/PublicNavbar'
import Footer from '@/components/layout/Footer'
import SEOHead from '@/components/shared/SEOHead'
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
  const targetRef = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (targetRef.current) observer.observe(targetRef.current)
    return () => observer.disconnect()
  }, [])
  return { targetRef, visible }
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
  { icon: Zap, title: 'Skill-Based Search', desc: 'Find candidates by exact skill match - no keyword guessing, no wasted time.' },
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
  'Detailed match breakdowns - no black box',
  'Application tracking and hiring pipeline',
  'Build talent pools for future hiring needs',
]

const testimonials = [
  {
    name: 'Samuel Chen',
    role: 'Engineering Lead',
    company: 'TechVault Inc',
    quote: 'TalentTap cut our time-to-hire by 60%. The AI matching is scary accurate - we found our senior engineer in 3 days.',
    pic: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'David Martinez',
    role: 'Full-Stack Developer',
    company: 'Hired via TalentTap',
    quote: 'I created my profile on a Sunday and had 4 interview requests by Wednesday. Game changer for passive job seekers.',
    pic: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
  {
    name: 'Ethan Roberts',
    role: 'VP of People',
    company: 'DataFlow Labs',
    quote: 'The quality of candidates is outstanding. Every shortlist feels hand-picked, but it\'s the AI doing the heavy lifting.',
    pic: 'https://randomuser.me/api/portraits/men/60.jpg',
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
    a: 'Unlike traditional job boards where candidates apply and wait, TalentTap inverts the model - candidates create profiles and companies discover them. Our AI proactively matches talent to roles based on deep skill and experience analysis.',
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
    a: 'Yes. We use industry-standard encryption for all data in transit and at rest. Contact information is only visible to authenticated recruiters - public visitors can see your skills and experience but not your email or phone.',
  },
]

/* ─── FAQ Item ─── */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-base font-semibold text-slate-800 pr-4">{q}</span>
        <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${open ? 'bg-violet-100 rotate-180' : 'bg-slate-100'}`}>
          <ChevronDown className={`h-4 w-4 ${open ? 'text-violet-600' : 'text-slate-400'}`} />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-sm leading-relaxed text-slate-500">{a}</p>
      </div>
    </div>
  )
}

/* ─── Stat Card ─── */
function StatCounter({ value, suffix, label }) {
  const { count, ref } = useCountUp(value)
  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl font-black text-slate-900 sm:text-5xl">
        <span className="text-gradient-primary">{count.toLocaleString()}{suffix}</span>
      </p>
      <p className="mt-2 text-sm font-medium text-slate-500">{label}</p>
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
      <SEOHead 
        title="TalentTap | Global AI-Powered Talent Matching Platform"
        description="Hire top 1% software engineers globally. TalentTap uses AI to match software houses with pre-vetted digital professionals. Reduce hiring time by 70%."
      />
      <PublicNavbar />

      {/* ── 1. HERO ── */}
      <section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24" style={{ background: 'linear-gradient(to bottom, hsl(224,40%,97%), white)' }}>
        {/* Brand mesh background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-15%] right-[-5%] h-[600px] w-[600px] animate-pulse-soft rounded-full bg-gradient-to-br from-violet-500/12 to-indigo-500/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] h-[500px] w-[500px] animate-pulse-soft rounded-full bg-gradient-to-tr from-amber-500/8 to-violet-500/8 blur-[100px]" style={{ animationDelay: '2s' }} />
        </div>

        <div ref={heroReveal.targetRef} className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className={`mb-8 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-semibold text-violet-700 shadow-sm transition-all duration-700 ${heroReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Sparkles className="h-4 w-4 text-violet-500" />
              AI-Powered Talent Intelligence Platform
            </div>

            {/* Headline */}
            <h1 className={`text-[3.5rem] font-black leading-[1.05] tracking-tight text-slate-900 sm:text-6xl lg:text-[5.5rem] transition-all duration-700 delay-100 ${heroReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Stop Applying.<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600">
                Start Getting Discovered.
              </span>
            </h1>

            {/* Subheadline */}
            <p className={`mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-500 sm:text-xl transition-all duration-700 delay-200 ${heroReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              TalentTap AI matches candidates with the right companies automatically —
              no more endless applications, no more filtering thousands of resumes.
            </p>

            {/* CTAs */}
            <div className={`mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row transition-all duration-700 delay-300 ${heroReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Link
                to="/register"
                className="btn btn-primary btn-lg w-full sm:w-auto"
              >
                Start Hiring Top Talent
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/register"
                className="btn btn-secondary btn-lg w-full sm:w-auto"
              >
                I'm a Candidate
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Hero visual - premium mock dashboard */}
          <div className={`mx-auto mt-14 max-w-5xl transition-all duration-1000 delay-500 ${heroReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div>
              {/* Outer frame */}
              <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xl shadow-slate-900/10 overflow-hidden transform-gpu">
                {/* Mock browser bar */}
                <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="mx-auto flex items-center justify-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-1 text-xs text-slate-500 font-medium w-64 shadow-sm">
                    <Shield className="h-3.5 w-3.5 text-emerald-500" />
                    app.TalentTapAi.com/dashboard
                  </div>
                </div>
                {/* Dashboard content */}
                <div className="p-5 sm:p-6 bg-gradient-mesh">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">Recruiting Command Center</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Powered by TalentTap AI</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-200 px-3 py-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                      <span className="text-xs font-bold text-violet-600">AI Active</span>
                    </div>
                  </div>
                  {/* Stat cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    {[
                      { bg: 'bg-violet-50 border-violet-100', title: 'Active Jobs', val: '24', color: 'text-violet-700' },
                      { bg: 'bg-emerald-50 border-emerald-100', title: 'AI Matches', val: '115', color: 'text-emerald-700' },
                      { bg: 'bg-amber-50 border-amber-100', title: 'Interviews', val: '18', color: 'text-amber-700' },
                      { bg: 'bg-blue-50 border-blue-100', title: 'Offers Sent', val: '4', color: 'text-blue-700' },
                    ].map((stat, i) => (
                      <div key={i} className={`${stat.bg} rounded-xl p-3 sm:p-4 border`}>
                        <div className="text-[11px] text-slate-500 font-medium mb-1">{stat.title}</div>
                        <div className={`text-xl sm:text-2xl font-black ${stat.color}`}>{stat.val}</div>
                      </div>
                    ))}
                  </div>
                  {/* Candidate rows */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">Top AI Matches</span>
                      <span className="badge badge-primary text-[11px]">Live</span>
                    </div>
                    <div className="p-2 space-y-1.5">
                      {[
                        {name: 'Elias Pena', role: 'Product Designer', score: 92, img: 'https://i.pravatar.cc/150?u=elias'},
                        {name: 'Arlen McCoy', role: 'Frontend Lead', score: 87, img: 'https://i.pravatar.cc/150?u=arlen'},
                        {name: 'Jerome Bell', role: 'QA Engineer', score: 78, img: 'https://i.pravatar.cc/150?u=jerome'}
                      ].map((c, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50 transition-colors">
                          <img src={c.img} alt={c.name} className="h-9 w-9 rounded-full object-cover border border-slate-200 shadow-sm flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-900 truncate">{c.name}</div>
                            <div className="text-xs text-slate-400 truncate">{c.role}</div>
                          </div>
                          <div className={`rounded-full px-2.5 py-1 text-xs font-black ${c.score >= 90 ? 'bg-emerald-100 text-emerald-700' : c.score >= 80 ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'}`}>
                            {c.score}% match
                          </div>
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

      {/* ── 2. TRUST BAR ── */}
      <section className="border-y border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-16 sm:grid-cols-4 sm:px-6">
          {stats.map((s) => (
            <StatCounter key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* ── 3. PROBLEM SECTION ── */}
      <section className="py-12 sm:py-20">
        <div ref={problemReveal.targetRef} className="mx-auto max-w-7xl px-4 sm:px-6">
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
              <div className="mt-8 flex items-center gap-3 rounded-xl bg-ai/10 p-4">
                <Sparkles className="h-5 w-5 text-ai flex-shrink-0" />
                <p className="text-sm font-medium text-ai">TalentTap AI solves this by inverting the model - candidates get discovered, recruiters get recommendations.</p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="rounded-2xl bg-gradient-to-br from-red-50 to-amber-50 p-6 sm:p-8">
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
      <section className="bg-slate-50 py-16 sm:py-24 border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 border border-violet-200 px-4 py-1.5 text-xs font-bold text-violet-700 uppercase tracking-wider mb-4">
              <Sparkles className="h-3.5 w-3.5" /> How It Works
            </span>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Three steps. Zero hassle.</h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { step: '01', icon: UserCheck, title: 'Create Your Profile', desc: 'Candidates add skills, experience, and preferences. Recruiters post their open roles.', color: 'bg-violet-100 text-violet-600' },
              { step: '02', icon: Brain, title: 'AI Finds Matches', desc: 'Our engine scores every candidate-job pair across 5 dimensions and ranks them in real-time.', color: 'bg-indigo-100 text-indigo-600' },
              { step: '03', icon: Zap, title: 'Connect & Hire', desc: 'Review detailed match breakdowns, shortlist top talent, and start conversations directly.', color: 'bg-amber-100 text-amber-600' },
            ].map(({ step, icon: Icon, title, desc, color }, i) => (
              <div key={step} className="card-premium group relative p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-5xl font-black text-slate-100 group-hover:text-violet-100 transition-colors leading-none">{step}</span>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
                {i < 2 && (
                  <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 md:flex h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm z-10">
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. FEATURES ── */}
      <section className="py-16 sm:py-24 bg-white relative">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-violet-500/5 blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 border border-violet-200 px-4 py-1.5 text-xs font-bold text-violet-700 uppercase tracking-wider mb-4">
              Platform Features
            </span>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Everything you need for modern hiring</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-500">A complete platform built from the ground up to make talent discovery effortless.</p>
          </div>
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }, idx) => (
              <div key={title} className="card-premium group p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-24 w-24 bg-violet-500/4 rounded-bl-full transition-transform duration-500 group-hover:scale-150" />
                <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 border border-violet-100">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. FOR CANDIDATES ── */}
      <section className="bg-slate-50/50 py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute top-1/4 left-0 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
        <div ref={candidateReveal.targetRef} className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className={`grid items-center gap-12 lg:grid-cols-2 transition-all duration-700 ${candidateReveal.visible ? 'opacity-100' : 'opacity-0'}`}>
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-emerald-600">For Candidates</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Build your profile once.{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">Get discovered.</span>
              </h2>
              <p className="mt-4 text-slate-600 text-lg">
                No more submitting hundreds of applications into the void. Create your professional profile and let top companies come to you.
              </p>
              <ul className="mt-8 space-y-4">
                {candidateBenefits.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 drop-shadow-sm" />
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="mt-10 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-500 hover:-translate-y-0.5 transition-all"
              >
                Create Free Profile <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex justify-center perspective-1000">
              <div className="w-full max-w-sm rounded-3xl border border-white/60 bg-white/40 p-6 backdrop-blur-2xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-4 mb-5">
                  <img src="https://randomuser.me/api/portraits/men/75.jpg" alt="John Doe" className="h-16 w-16 rounded-full object-cover border-4 border-white shadow-md" />
                  <div>
                    <div className="font-bold text-slate-900 text-lg">John Doe</div>
                    <div className="text-sm font-medium text-slate-500">Senior React Engineer</div>
                  </div>
                </div>
                <div className="space-y-4 mt-4">
                  <div className="flex gap-2">
                    {['React', 'Python', 'AWS'].map(s => (
                      <span key={s} className="rounded-full bg-emerald-100/80 border border-emerald-200/50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">{s}</span>
                    ))}
                  </div>
                  <div className="rounded-2xl bg-white/80 p-4 shadow-sm border border-white">
                    <p className="text-xs text-slate-500 mb-2 font-medium">Match Score to TechVault</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full w-[92%] bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full relative">
                          <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                        </div>
                      </div>
                      <span className="text-sm font-black text-emerald-600">92%</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/5 p-3.5 border border-emerald-100">
                    <p className="text-xs font-semibold text-emerald-700">🎯 3 new companies interested in your profile</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. FOR RECRUITERS ── */}
      <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
        <div className="absolute bottom-1/4 right-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
        <div ref={recruiterReveal.targetRef} className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className={`grid items-center gap-12 lg:grid-cols-2 transition-all duration-700 ${recruiterReveal.visible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="order-2 lg:order-1 flex justify-center perspective-1000">
              <div className="w-full max-w-sm rounded-3xl border border-slate-200/50 bg-white/60 p-6 shadow-[0_20px_40px_rgba(0,0,0,0.06)] backdrop-blur-2xl animate-float">
                <div className="flex items-center justify-between mb-5">
                  <div className="font-bold text-slate-900 text-base">Top AI Matches</div>
                  <div className="rounded-full bg-indigo-100 border border-indigo-200 px-3 py-1 text-[10px] font-black text-indigo-700 flex items-center gap-1.5 shadow-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></div> LIVE
                  </div>
                </div>
                {[
                  { name: 'Alex Johnson', score: 95, skill: 'Full-Stack Lead', pic: 'https://randomuser.me/api/portraits/men/85.jpg' },
                  { name: 'Bob Williams', score: 88, skill: 'Backend Engineer', pic: 'https://randomuser.me/api/portraits/men/11.jpg' },
                  { name: 'Charlie Davis', score: 82, skill: 'Frontend Developer', pic: 'https://randomuser.me/api/portraits/men/29.jpg' },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl bg-white/90 p-3 mb-3 shadow-sm border border-slate-100 transition-transform hover:-translate-y-0.5">
                    <img src={c.pic} alt={c.name} className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{c.skill}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-xs font-black ${c.score >= 90 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>{c.score}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">For Recruiters</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Find the perfect candidate in{' '}
                <span className="text-gradient">seconds, not weeks.</span>
              </h2>
              <p className="mt-4 text-slate-600 text-lg">
                Stop sifting through hundreds of irrelevant applications. Let AI surface the candidates who actually match your requirements.
              </p>
              <ul className="mt-8 space-y-4">
                {recruiterBenefits.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <CheckCircle className="h-5 w-5 text-indigo-500 flex-shrink-0 drop-shadow-sm" />
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="mt-10 inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow-xl hover:bg-slate-800 hover:-translate-y-0.5 transition-all"
              >
                Start Hiring Free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section ref={showcaseReveal.targetRef} className="bg-slate-50/50 py-16 sm:py-24 border-y border-border/60 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center relative z-10">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Match Intelligence</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">See exactly why you match</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600 text-lg">
            Our AI doesn't just give you a black-box score. It breaks down exactly why a candidate is the perfect fit.
          </p>
          <div className={`mx-auto mt-16 max-w-3xl transition-all duration-1000 ${showcaseReveal.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="glass-panel rounded-3xl p-6 sm:p-10 text-left border-white/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                 <div className="flex items-center gap-5">
                   <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="David Smith" className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-md" />
                   <div>
                     <h3 className="text-2xl font-black text-slate-900">David Smith</h3>
                     <p className="text-sm text-slate-500 font-medium mt-0.5">Applied for Senior Backend Engineer</p>
                   </div>
                 </div>
                <div className="flex flex-col sm:items-end">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Overall Match</span>
                  <span className="text-4xl font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-5 py-2 rounded-xl inline-block w-fit shadow-sm">94%</span>
                </div>
              </div>
              <div className="space-y-5">
                {[
                  { label: 'Skills Match', score: 98, note: 'Matches all required skills (Python, Django, AWS)' },
                  { label: 'Experience Level', score: 95, note: '6 years experience (Role requires 5+)' },
                  { label: 'Location Fit', score: 100, note: 'Open to Remote (Role is Remote)' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-3 p-5 rounded-2xl bg-white/70 border border-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{item.label}</span>
                      <span className="font-black text-slate-900">{item.score}%</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 mt-1">
                      <div className="w-full sm:flex-1 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full relative transition-all duration-1000" style={{ width: `${item.score}%` }}>
                           <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                        </div>
                      </div>
                      <span className="text-sm text-slate-500 sm:min-w-[280px] font-medium">{item.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. TESTIMONIALS ── */}
      <section className="py-16 sm:py-24 bg-white relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Testimonials</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Loved by teams and talent</h2>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {testimonials.map(({ name, role, company, quote, pic }) => (
              <div key={name} className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between h-full">
                <div>
                  <Quote className="h-8 w-8 text-primary/30 mb-6" />
                  <p className="text-base leading-relaxed text-slate-700 italic font-medium">"{quote}"</p>
                </div>
                <div className="mt-8 flex items-center gap-4 pt-6 border-t border-slate-100">
                  <img src={pic} alt={name} className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{name}</p>
                    <p className="text-xs text-slate-500 font-medium">{role} at {company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. FAQ ── */}
      <section className="bg-white py-12 sm:py-20">
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
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(224,60%,8%)] via-[hsl(240,50%,12%)] to-[hsl(263,55%,16%)] px-8 py-16 text-center sm:px-16 sm:py-20">
            <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/15 border border-violet-500/20 px-4 py-1.5 mb-6">
                <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-xs font-bold text-violet-300 uppercase tracking-wider">Join 15,000+ users</span>
              </div>
              <h2 className="text-3xl font-black text-white sm:text-4xl tracking-tight">
                Ready to transform your hiring?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
                Join thousands of companies and candidates using AI to make better hiring decisions, faster.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="btn w-full sm:w-auto justify-center bg-white text-slate-900 hover:bg-slate-100 shadow-lg px-8 py-3.5"
                >
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/contact"
                  className="btn w-full sm:w-auto justify-center border border-white/20 text-white hover:bg-white/10 px-8 py-3.5"
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
