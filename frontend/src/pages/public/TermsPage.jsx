import PublicNavbar from '@/components/layout/PublicNavbar'
import Footer from '@/components/layout/Footer'
import SEOHead from '@/components/shared/SEOHead'

export default function TermsPage() {
 return (
  <div className="min-h-screen bg-background">
   <SEOHead 
    title="Terms of Service | TalentTap"
    description="TalentTap Terms of Service. Read the terms and conditions for using our AI hiring platform."
   />
   <PublicNavbar />
   <section className="pt-32 pb-24">
    <div className="mx-auto max-w-3xl px-4 sm:px-6">
     <span className="text-sm font-semibold uppercase tracking-wider text-primary">Legal</span>
     <h1 className="mt-3 text-4xl font-bold tracking-tight">Terms of Service</h1>
     <p className="mt-4 text-muted-foreground">Last updated: June 1, 2025</p>

     <div className="mt-12 space-y-8">
      <section>
       <h2 className="text-xl font-bold">1. Acceptance of Terms</h2>
       <p className="mt-3 text-sm text-muted-foreground leading-relaxed">By accessing or using TalentTap AI ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Platform. We may update these terms from time to time, and your continued use constitutes acceptance of any changes.</p>
      </section>

      <section>
       <h2 className="text-xl font-bold">2. User Accounts</h2>
       <p className="mt-3 text-sm text-muted-foreground leading-relaxed">You must create an account to access most features. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account. You must provide accurate, current, and complete information. You may not create accounts for others without their permission or impersonate another person.</p>
      </section>

      <section>
       <h2 className="text-xl font-bold">3. Acceptable Use</h2>
       <p className="mt-3 text-sm text-muted-foreground leading-relaxed">You agree not to: post false or misleading information, harass or discriminate against other users, use the Platform for illegal purposes, scrape or harvest data without permission, attempt to gain unauthorized access to other accounts or systems, or use automated tools to interact with the Platform without our consent.</p>
      </section>

      <section>
       <h2 className="text-xl font-bold">4. Content</h2>
       <p className="mt-3 text-sm text-muted-foreground leading-relaxed">You retain ownership of content you post. By posting content, you grant TalentTap AI a non-exclusive, worldwide license to use, display, and distribute that content for the purpose of providing our services. You are responsible for ensuring your content does not violate any third-party rights.</p>
      </section>

      <section>
       <h2 className="text-xl font-bold">5. AI Matching</h2>
       <p className="mt-3 text-sm text-muted-foreground leading-relaxed">Our AI matching system provides recommendations based on the information provided by users. Match scores are informational and do not guarantee employment outcomes. TalentTap AI is not responsible for hiring decisions made by recruiters or companies using our platform.</p>
      </section>

      <section>
       <h2 className="text-xl font-bold">6. Termination</h2>
       <p className="mt-3 text-sm text-muted-foreground leading-relaxed">We may suspend or terminate your account at our discretion if you violate these terms. You may delete your account at any time through your profile settings. Upon termination, your right to use the Platform ceases immediately.</p>
      </section>

      <section>
       <h2 className="text-xl font-bold">7. Limitation of Liability</h2>
       <p className="mt-3 text-sm text-muted-foreground leading-relaxed">TalentTap AI is provided"as is"without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Platform. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
      </section>

      <section>
       <h2 className="text-xl font-bold">8. Contact</h2>
       <p className="mt-3 text-sm text-muted-foreground leading-relaxed">For questions about these terms, contact us at legal@talenttap.ai or write to TalentTap AI, San Francisco, CA, United States.</p>
      </section>
     </div>
    </div>
   </section>
   <Footer />
  </div>
 )
}
