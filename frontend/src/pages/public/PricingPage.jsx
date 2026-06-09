import PublicNavbar from '@/components/layout/PublicNavbar'
import Footer from '@/components/layout/Footer'
import { Link } from 'react-router-dom'
import { Check, Sparkles, ArrowRight, Zap } from 'lucide-react'
import SEOHead from '@/components/shared/SEOHead'

const plans = [
 {
  name: 'Candidate',
  price: 'Free',
  period: 'forever',
  desc: 'For job seekers ready to get discovered',
  cta: 'Create Free Profile',
  highlight: false,
  features: [
   'Public profile page',
   'AI match scoring',
   'Apply to unlimited jobs',
   'Direct messaging with recruiters',
   'Profile analytics',
   'Skills & experience showcase',
  ],
 },
 {
  name: 'Recruiter',
  price: '$49',
  period: 'per month',
  desc: 'For hiring teams ready to move fast',
  cta: 'Start Hiring Free',
  highlight: true,
  badge: 'Most Popular',
  features: [
   'Everything in Candidate, plus:',
   'Unlimited job postings',
   'AI-ranked candidate matches',
   'Advanced candidate search',
   'Shortlists & talent pools',
   'Bulk messaging & outreach',
   'Application tracking pipeline',
   'Match score breakdowns',
   'Team collaboration (up to 5 seats)',
  ],
 },
 {
  name: 'Enterprise',
  price: 'Custom',
  period: 'contact us',
  desc: 'For large teams with complex hiring needs',
  cta: 'Contact Sales',
  highlight: false,
  features: [
   'Everything in Recruiter, plus:',
   'Unlimited team seats',
   'Dedicated account manager',
   'Custom AI model tuning',
   'SSO & advanced security',
   'SLA guarantees',
   'API access',
   'Custom integrations',
   'Priority support',
  ],
 },
]

export default function PricingPage() {
 return (
  <div className="min-h-screen bg-background">
   <SEOHead 
    title="Pricing | Transparent Hiring Plans for Software Houses"
    description="Flexible, cost-effective pricing plans for software houses of all sizes worldwide. Free for candidates. Start hiring smarter with TalentTap AI today."
   />
   <PublicNavbar />

   {/* Hero */}
   <section className="pt-32 pb-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
     <span className="text-sm font-semibold uppercase tracking-wider text-primary">Pricing</span>
     <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
      Simple, transparent pricing
     </h1>
     <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
      Free for candidates. Fair pricing for companies. No hidden fees.
     </p>
    </div>
   </section>

   {/* Plans */}
   <section className="pb-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
     <div className="grid gap-8 lg:grid-cols-3 items-start">
      {plans.map((plan) => (
       <div
        key={plan.name}
        className={`relative rounded-2xl p-8 transition-all ${
         plan.highlight
          ? 'border-2 border-primary bg-primary shadow-xl shadow-primary/10 text-primary-foreground scale-105'
          : 'border bg-white hover:shadow-lg'
        }`}
       >
        {plan.badge && (
         <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-primary shadow-md">
           <Sparkles className="h-3 w-3"/> {plan.badge}
          </span>
         </div>
        )}

        <div>
         <h2 className={`text-lg font-bold ${plan.highlight ? 'text-white' : ''}`}>{plan.name}</h2>
         <p className={`text-sm mt-1 ${plan.highlight ? 'text-blue-100' : 'text-muted-foreground'}`}>{plan.desc}</p>
         <div className="mt-6 flex items-end gap-1">
          <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : ''}`}>{plan.price}</span>
          <span className={`mb-1 text-sm ${plan.highlight ? 'text-blue-100' : 'text-muted-foreground'}`}>/{plan.period}</span>
         </div>
        </div>

        <Link
         to={plan.name === 'Enterprise' ? '/contact' : '/register'}
         className={`mt-6 block w-full rounded-full py-3 text-center text-sm font-semibold transition-all ${
          plan.highlight
           ? 'bg-white text-primary hover:bg-slate-100'
           : 'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20'
         }`}
        >
         {plan.cta}
        </Link>

        <ul className="mt-8 space-y-3">
         {plan.features.map((f) => (
          <li key={f} className={`flex items-start gap-3 text-sm ${plan.highlight ? 'text-blue-50' : 'text-muted-foreground'}`}>
           <Check className={`mt-0.5 h-4 w-4 flex-shrink-0 ${plan.highlight ? 'text-white' : 'text-emerald-500'}`} />
           {f}
          </li>
         ))}
        </ul>
       </div>
      ))}
     </div>
    </div>
   </section>

   {/* FAQ mini */}
   <section className="bg-white py-20">
    <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
     <h2 className="text-2xl font-bold">Have questions?</h2>
     <p className="mt-3 text-muted-foreground">Check out our FAQ or reach out to our team directly.</p>
     <div className="mt-6 flex justify-center gap-3">
      <Link to="/faq"className="rounded-full border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
       View FAQ
      </Link>
      <Link to="/contact"className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-all">
       Contact Us <ArrowRight className="h-4 w-4"/>
      </Link>
     </div>
    </div>
   </section>

   <Footer />
  </div>
 )
}
