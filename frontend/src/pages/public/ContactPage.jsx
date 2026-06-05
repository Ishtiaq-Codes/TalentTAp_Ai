import { useState } from 'react'
import PublicNavbar from '@/components/layout/PublicNavbar'
import Footer from '@/components/layout/Footer'
import { Mail, MapPin, Phone, Send, CheckCircle } from 'lucide-react'
import SEOHead from '@/components/shared/SEOHead'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSent(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Contact Us | TalentTap Sales & Support"
        description="Get in touch with the TalentTap team for enterprise hiring solutions, support, or global partnership inquiries."
      />
      <PublicNavbar />

      <section className="pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Contact</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Get in touch</h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Have a question, feedback, or partnership inquiry? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Contact info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-xl font-bold">Contact Information</h2>
                <p className="mt-2 text-sm text-muted-foreground">Fill out the form or reach us through any of the channels below.</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Email</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">support@talenttap.ai</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Phone</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Office</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">San Francisco, CA<br />United States</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-blue-50 p-6">
                <h3 className="font-semibold">Response Time</h3>
                <p className="mt-1 text-sm text-muted-foreground">We typically respond within 24 hours during business days.</p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              {sent ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border bg-white p-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold">Message Sent!</h3>
                  <p className="mt-2 text-muted-foreground">Thank you for reaching out. We'll get back to you shortly.</p>
                  <button onClick={() => setSent(false)} className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-all">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-8 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium" htmlFor="contact-name">Full Name</label>
                      <input id="contact-name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                        className="mt-1.5 block w-full rounded-xl border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="text-sm font-medium" htmlFor="contact-email">Email</label>
                      <input id="contact-email" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                        className="mt-1.5 block w-full rounded-xl border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="john@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="contact-subject">Subject</label>
                    <input id="contact-subject" required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                      className="mt-1.5 block w-full rounded-xl border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="How can we help?" />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="contact-message">Message</label>
                    <textarea id="contact-message" required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                      className="mt-1.5 block w-full rounded-xl border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                      placeholder="Tell us more about your inquiry..." />
                  </div>
                  <button type="submit" disabled={sending}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all">
                    <Send className="h-4 w-4" /> {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
