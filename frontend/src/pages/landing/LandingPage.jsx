import { Link, Navigate } from 'react-router-dom'
import { useAuth, getDashboardPath } from '@/contexts/AuthContext'
import Logo from '@/components/common/Logo'
import {
  Sparkles, ArrowRight, Users, Briefcase, Brain,
  CheckCircle, Zap, Shield, Globe,
} from 'lucide-react'

const features = [
  { icon: Brain, title: 'AI-Powered Matching', desc: 'Our scoring engine analyzes skills, experience, location, and availability to find the perfect match.' },
  { icon: Users, title: 'Talent Marketplace', desc: 'Candidates create profiles once. Recruiters discover them automatically.' },
  { icon: Zap, title: 'Instant Results', desc: 'Get ranked candidate recommendations the moment you post a job.' },
  { icon: Shield, title: 'Transparent Scoring', desc: 'Every match comes with a detailed breakdown — no black box AI.' },
  { icon: Globe, title: 'Global Reach', desc: 'Connect with talent and opportunities worldwide, remote-first.' },
  { icon: Briefcase, title: 'Modern Hiring', desc: 'Application tracking, shortlists, messaging — everything in one place.' },
]

const stats = [
  { value: '10K+', label: 'Active Candidates' },
  { value: '500+', label: 'Companies' },
  { value: '2K+', label: 'Jobs Posted' },
  { value: '89%', label: 'Match Accuracy' },
]

export default function LandingPage() {
  const { user, loading } = useAuth()

  // Redirect logged-in users to their dashboard
  if (!loading && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-3">
            <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>AI-Powered Talent Matching</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              The Best Candidate
              <span className="block text-primary">Matched to the Best Opportunity</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              TalentTap AI is the modern talent marketplace where candidates create profiles once
              and companies automatically discover the most qualified matches using AI.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:shadow-xl"
              >
                Start Hiring <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold hover:bg-muted transition-colors"
              >
                I'm a Candidate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-bold text-primary">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Why TalentTap AI?</h2>
          <p className="mt-2 text-muted-foreground">Everything you need for modern, intelligent hiring.</p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <h2 className="text-center text-3xl font-bold">How It Works</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              { step: '1', title: 'Create Your Profile', desc: 'Candidates add skills, experience, and preferences. Companies set up their hiring needs.' },
              { step: '2', title: 'AI Finds Matches', desc: 'Our engine scores every candidate-job pair across 5 dimensions and ranks them.' },
              { step: '3', title: 'Connect & Hire', desc: 'Review match breakdowns, shortlist candidates, and start conversations.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {step}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-12 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold">Ready to Transform Your Hiring?</h2>
          <p className="mt-4 text-lg opacity-90">Join thousands of companies using AI to find the perfect candidates.</p>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary hover:bg-white/90 transition-colors"
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center justify-between">
            <Logo />
            <p className="text-sm text-muted-foreground">© 2025 TalentTap AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
