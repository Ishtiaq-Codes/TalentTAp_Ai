import PublicNavbar from '@/components/layout/PublicNavbar'
import Footer from '@/components/layout/Footer'
import SEOHead from '@/components/shared/SEOHead'

export default function PrivacyPage() {
 return (
  <div className="min-h-screen bg-background">
   <SEOHead 
    title="Privacy Policy | TalentTap"
    description="TalentTap Privacy Policy. Learn how we collect, use, and protect your data."
   />
   <PublicNavbar />
   <section className="pt-32 pb-24">
    <div className="mx-auto max-w-3xl px-4 sm:px-6">
     <span className="text-sm font-semibold uppercase tracking-wider text-primary">Legal</span>
     <h1 className="mt-3 text-4xl font-bold tracking-tight">Privacy Policy</h1>
     <p className="mt-4 text-muted-foreground">Last updated: June 1, 2025</p>

     <div className="mt-12 prose prose-slate max-w-none space-y-8">
      <section>
       <h2 className="text-xl font-bold">1. Information We Collect</h2>
       <p className="mt-3 text-sm text-muted-foreground leading-relaxed">We collect information you provide directly when creating an account, including your name, email address, professional details, skills, work experience, and any content you upload such as resumes, portfolio links, and profile photos. We also collect usage data such as pages visited, features used, and interaction timestamps.</p>
      </section>

      <section>
       <h2 className="text-xl font-bold">2. How We Use Your Information</h2>
       <p className="mt-3 text-sm text-muted-foreground leading-relaxed">Your information is used to provide and improve our services, including: generating AI match scores between candidates and job postings, displaying your profile to authenticated recruiters, facilitating messaging between users, sending notifications about matches and applications, and analyzing platform usage to improve the product.</p>
      </section>

      <section>
       <h2 className="text-xl font-bold">3. Information Sharing</h2>
       <p className="mt-3 text-sm text-muted-foreground leading-relaxed">We do not sell your personal information to third parties. Your professional profile (skills, experience, headline) may be visible to other platform users. Contact information (email, phone) is only shared with authenticated recruiters. We may share aggregated, anonymized data for analytics purposes.</p>
      </section>

      <section>
       <h2 className="text-xl font-bold">4. Data Security</h2>
       <p className="mt-3 text-sm text-muted-foreground leading-relaxed">We implement industry-standard security measures including TLS encryption for data in transit, encrypted storage for sensitive data at rest, regular security audits, and access controls to limit data exposure. However, no method of transmission over the internet is 100% secure.</p>
      </section>

      <section>
       <h2 className="text-xl font-bold">5. Your Rights</h2>
       <p className="mt-3 text-sm text-muted-foreground leading-relaxed">You have the right to: access your personal data, correct inaccurate information, delete your account and associated data, export your data in a portable format, and opt out of non-essential communications. To exercise these rights, contact us at privacy@talenttap.ai.</p>
      </section>

      <section>
       <h2 className="text-xl font-bold">6. Cookies</h2>
       <p className="mt-3 text-sm text-muted-foreground leading-relaxed">We use essential cookies to maintain your session and authentication state. We may use analytics cookies to understand platform usage. You can control cookie preferences through your browser settings.</p>
      </section>

      <section>
       <h2 className="text-xl font-bold">7. Contact</h2>
       <p className="mt-3 text-sm text-muted-foreground leading-relaxed">For privacy-related inquiries, contact our Data Protection Officer at privacy@talenttap.ai or write to us at TalentTap AI, San Francisco, CA, United States.</p>
      </section>
     </div>
    </div>
   </section>
   <Footer />
  </div>
 )
}
