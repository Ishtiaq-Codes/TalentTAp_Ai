import PublicNavbar from '@/components/layout/PublicNavbar'
import Footer from '@/components/layout/Footer'
import { Link } from 'react-router-dom'
import {
  Brain, Search, BarChart3, Target, Zap, Globe,
  MessageSquare, Shield, Users, FileText, ArrowRight, CheckCircle,
} from 'lucide-react'

const features = [
  {
    icon: Brain, title: 'AI-Powered Matching',
    desc: 'Our multi-dimensional scoring engine analyzes skills, experience, location, availability, and employment type to produce precise match scores for every candidate-job pair.',
    highlights: ['5-dimension scoring', 'Real-time results', 'Transparent breakdowns'],
  },
  {
    icon: Search, title: 'Smart Candidate Discovery',
    desc: 'Search and filter talent by skills, location, experience level, salary expectations, and availability. Find the right person in seconds.',
    highlights: ['Advanced filters', 'Skill-based search', 'Instant results'],
  },
  {
    icon: BarChart3, title: 'Recruiter Dashboard',
    desc: 'A command center for your hiring pipeline. Track active jobs, monitor applications, review match rankings, and manage shortlists.',
    highlights: ['Pipeline overview', 'Application tracking', 'Analytics'],
  },
  {
    icon: Target, title: 'Talent Pools & Shortlists',
    desc: 'Save and organize top candidates into shortlists. Build talent pools for current and future positions.',
    highlights: ['One-click shortlist', 'Organized pools', 'Notes & tags'],
  },
  {
    icon: MessageSquare, title: 'Built-in Messaging',
    desc: 'Communicate directly with candidates through our integrated messaging system. No need to leave the platform.',
    highlights: ['Real-time chat', 'Read receipts', 'In-context messaging'],
  },
  {
    icon: Globe, title: 'Global Hiring',
    desc: 'Connect with talent worldwide. Filter by remote, hybrid, or on-site preferences with timezone-aware matching.',
    highlights: ['Remote-first', 'Global reach', 'Location matching'],
  },
  {
    icon: Shield, title: 'Transparent Scoring',
    desc: 'Every match comes with a detailed breakdown across all dimensions. No black box AI — see exactly why a candidate was recommended.',
    highlights: ['Full breakdown', 'Dimension scores', 'No hidden bias'],
  },
  {
    icon: FileText, title: 'Application Management',
    desc: 'Track every application from submission to hire. Update statuses, leave notes, and keep your hiring process organized.',
    highlights: ['Status tracking', 'Pipeline stages', 'Team collaboration'],
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero */}
      <section className="pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Features</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Everything you need for <span className="text-primary">modern hiring</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            A complete AI-powered platform built from the ground up to make talent discovery effortless.
          </p>
        </div>
      </section>

      {/* Features list */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
          {features.map(({ icon: Icon, title, desc, highlights }, i) => (
            <div key={title} className={`grid gap-8 items-center lg:grid-cols-2 rounded-2xl border bg-white p-8 transition-all hover:shadow-lg ${i % 2 === 1 ? 'lg:direction-rtl' : ''}`}>
              <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-bold">{title}</h3>
                <p className="mt-3 text-muted-foreground">{desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {highlights.map(h => (
                    <span key={h} className="inline-flex items-center gap-1 rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                      <CheckCircle className="h-3 w-3" /> {h}
                    </span>
                  ))}
                </div>
              </div>
              <div className={`rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 p-6 h-48 flex items-center justify-center ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                <Icon className="h-20 w-20 text-primary/10" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold">Ready to try it?</h2>
          <p className="mt-4 text-muted-foreground">Start using TalentTap AI today — completely free for candidates and recruiters.</p>
          <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
