import { useState } from 'react'
import PublicNavbar from '@/components/layout/PublicNavbar'
import Footer from '@/components/layout/Footer'
import { ChevronDown } from 'lucide-react'

const faqs = [
  { cat: 'General', q: 'What is TalentTap AI?', a: 'TalentTap AI is an AI-powered talent marketplace. Candidates create profiles and get automatically discovered by companies. Recruiters post jobs and receive AI-ranked candidate recommendations instantly.' },
  { cat: 'General', q: 'Is TalentTap free to use?', a: 'Yes — completely free for candidates. Recruiters get a free trial and can upgrade to unlock unlimited job postings and advanced search features.' },
  { cat: 'Candidates', q: 'How does the AI matching work?', a: 'Our engine scores every candidate-job pair across 5 dimensions: skills match, experience level, location, availability, and employment type preference. Each dimension produces a 0-100 score that combines into an overall match percentage.' },
  { cat: 'Candidates', q: 'Will recruiters see my contact information?', a: 'Only authenticated, verified recruiters can view your contact details. Public visitors can see your skills, experience, and portfolio — but not your email or phone number.' },
  { cat: 'Candidates', q: 'Can I control who sees my profile?', a: 'Yes. You can toggle your profile visibility and set your availability status. Setting yourself as "not available" signals to recruiters you are not actively looking.' },
  { cat: 'Recruiters', q: 'How quickly do I receive candidate matches?', a: 'Matches are generated instantly. As soon as you post a job, our AI analyzes all available profiles and delivers ranked recommendations within seconds.' },
  { cat: 'Recruiters', q: 'Can I search for candidates without posting a job?', a: 'Yes! Our candidate search lets you filter by skills, location, experience, and availability to build talent pipelines proactively — even without an active job posting.' },
  { cat: 'Recruiters', q: 'What is a Shortlist?', a: 'A shortlist is a saved collection of candidates you are interested in. You can shortlist candidates from search results, match recommendations, or application lists — and then message them directly.' },
  { cat: 'Security', q: 'How is my data protected?', a: 'All data is encrypted in transit (TLS) and at rest. We follow OWASP security best practices, and contact information is gated behind authentication and role verification.' },
  { cat: 'Security', q: 'Can I delete my account?', a: 'Yes. You can delete your account at any time from your profile settings. All your data will be permanently removed within 30 days.' },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-5 text-left gap-4">
        <span className="text-base font-medium text-foreground">{q}</span>
        <ChevronDown className={`h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-sm leading-relaxed text-muted-foreground">{a}</p>
      </div>
    </div>
  )
}

const categories = ['All', ...new Set(faqs.map(f => f.cat))]

export default function FAQPage() {
  const [activecat, setActiveCat] = useState('All')
  const filtered = activecat === 'All' ? faqs : faqs.filter(f => f.cat === activecat)

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      <section className="pt-32 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">FAQ</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Frequently Asked Questions</h1>
          <p className="mt-6 text-lg text-muted-foreground">Everything you need to know about TalentTap AI.</p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Category filter */}
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${activecat === cat ? 'bg-primary text-white' : 'bg-white border hover:bg-muted'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border bg-white divide-y-0">
            {filtered.map(faq => <FAQItem key={faq.q} {...faq} />)}
          </div>

          <div className="mt-12 rounded-2xl bg-primary/5 border border-primary/10 p-8 text-center">
            <h3 className="font-semibold text-lg">Still have questions?</h3>
            <p className="mt-2 text-sm text-muted-foreground">Our team is happy to help with any questions you have.</p>
            <a href="/contact" className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-all">
              Contact Support
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
