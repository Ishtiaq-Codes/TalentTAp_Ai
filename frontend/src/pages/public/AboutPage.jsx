import PublicNavbar from '@/components/layout/PublicNavbar'
import Footer from '@/components/layout/Footer'
import { Link } from 'react-router-dom'
import { Users, Target, Globe, Heart, ArrowRight } from 'lucide-react'
import SEOHead from '@/components/shared/SEOHead'

const values = [
 { icon: Target, title: 'Mission-Driven', desc: 'We believe talent should be discovered, not filtered out. Our AI levels the playing field.' },
 { icon: Users, title: 'People-First', desc: 'Behind every profile is a real person. We design with empathy, transparency, and respect.' },
 { icon: Globe, title: 'Global Access', desc: 'Great talent exists everywhere. We connect companies with candidates across borders.' },
 { icon: Heart, title: 'Fairness by Design', desc: 'Our matching is based on skills and experience — not names, schools, or backgrounds.' },
]

const team = [
 { name: 'Alex Rivera', role: 'CEO & Co-founder', avatar: 'AR' },
 { name: 'Priya Sharma', role: 'CTO & Co-founder', avatar: 'PS' },
 { name: 'James Liu', role: 'Head of AI', avatar: 'JL' },
 { name: 'Sarah Kim', role: 'Head of Product', avatar: 'SK' },
]

export default function AboutPage() {
 return (
  <div className="min-h-screen bg-background">
   <SEOHead 
    title="About Us | The Mission Behind TalentTap"
    description="Learn how TalentTap is revolutionizing global IT recruitment by replacing manual screening with intelligent AI matching."
   />
   <PublicNavbar />

   {/* Hero */}
   <section className="pt-32 pb-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
     <span className="text-sm font-semibold uppercase tracking-wider text-primary">About Us</span>
     <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
      We're building the future of <span className="text-primary">talent discovery</span>
     </h1>
     <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
      TalentTap AI was founded on a simple belief: the best hiring happens when candidates are 
      discovered for their skills, not lost in a pile of resumes.
     </p>
    </div>
   </section>

   {/* Story */}
   <section className="bg-white py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
     <div className="grid gap-12 lg:grid-cols-2 items-center">
      <div>
       <h2 className="text-3xl font-bold tracking-tight">Our Story</h2>
       <div className="mt-6 space-y-4 text-muted-foreground">
        <p>Traditional hiring platforms force candidates to apply blindly and recruiters to filter manually. The result? Wasted time on both sides and great talent slipping through the cracks.</p>
        <p>TalentTap AI was born from the frustration of watching talented developers, designers, and engineers struggle to get noticed while companies desperately searched for the right people.</p>
        <p>We built an AI-powered marketplace that inverts the model: candidates create a profile once, and our matching engine does the rest — connecting them with companies who actually need their skills.</p>
       </div>
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-blue-50 p-8">
       <div className="grid grid-cols-2 gap-6 text-center">
        {[
         { value: '2024', label: 'Founded' },
         { value: '15K+', label: 'Users' },
         { value: '500+', label: 'Companies' },
         { value: '89%', label: 'Match Accuracy' },
        ].map(s => (
         <div key={s.label}>
          <p className="text-3xl font-bold text-primary">{s.value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
         </div>
        ))}
       </div>
      </div>
     </div>
    </div>
   </section>

   {/* Values */}
   <section className="py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
     <h2 className="text-center text-3xl font-bold tracking-tight">Our Values</h2>
     <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {values.map(({ icon: Icon, title, desc }) => (
       <div key={title} className="rounded-2xl border bg-white p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
         <Icon className="h-6 w-6"/>
        </div>
        <h3 className="mt-4 font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
       </div>
      ))}
     </div>
    </div>
   </section>

   {/* Team */}
   <section className="bg-white py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
     <h2 className="text-center text-3xl font-bold tracking-tight">Meet the Team</h2>
     <p className="text-center mt-3 text-muted-foreground">The people behind TalentTap AI</p>
     <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {team.map(({ name, role, avatar }) => (
       <div key={name} className="rounded-2xl border p-6 text-center transition-all hover:shadow-lg">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-blue-200 text-xl font-bold text-primary">
         {avatar}
        </div>
        <h3 className="mt-4 font-semibold">{name}</h3>
        <p className="text-sm text-muted-foreground">{role}</p>
       </div>
      ))}
     </div>
    </div>
   </section>

   {/* CTA */}
   <section className="py-20">
    <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
     <h2 className="text-3xl font-bold">Join us in reshaping hiring</h2>
     <p className="mt-4 text-muted-foreground">Whether you're looking for talent or looking for your next role, we'd love to have you.</p>
     <Link to="/register"className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
      Get Started Free <ArrowRight className="h-4 w-4"/>
     </Link>
    </div>
   </section>

   <Footer />
  </div>
 )
}
