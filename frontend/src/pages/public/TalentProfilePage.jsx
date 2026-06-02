import { useParams, useNavigate, Link } from 'react-router-dom'
import { useFetch } from '@/hooks/useFetch'
import { candidatesAPI } from '@/api/candidates'
import { useAuth } from '@/contexts/AuthContext'
import { getImageUrl } from '@/lib/utils'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import PublicNavbar from '@/components/layout/PublicNavbar'
import Footer from '@/components/layout/Footer'
import { MapPin, Briefcase, Calendar, Lock, ArrowRight, User } from 'lucide-react'

export default function TalentProfilePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Try to fetch. If unauthenticated, it will fail and we catch it.
  const { data: profile, loading, error } = useFetch(() => candidatesAPI.getPublicProfile(id))

  // If user is logged in as recruiter, redirect to the internal recruiter view
  if (user?.role === 'recruiter' || user?.role === 'company_admin') {
    navigate(`/recruiter/candidates/${id}`, { replace: true })
    return null
  }

  // If we get an unauthorized error (because we didn't touch backend), show a gated view
  const isGated = error && error.toLowerCase().includes('credentials were not provided')

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      
      <main className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
        {loading ? (
          <div className="animate-pulse space-y-8">
            <div className="h-64 rounded-3xl bg-slate-200" />
            <div className="h-40 rounded-3xl bg-slate-200" />
          </div>
        ) : isGated || error ? (
          <div className="overflow-hidden rounded-3xl border bg-white shadow-xl">
            <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900" />
            <div className="px-8 pb-12 text-center">
              <div className="mx-auto -mt-16 mb-6 flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-slate-100 shadow-md">
                <Lock className="h-10 w-10 text-slate-400" />
              </div>
              <h1 className="text-3xl font-bold">Talent Profile Hidden</h1>
              <p className="mx-auto mt-4 max-w-md text-muted-foreground">
                This candidate's profile is only visible to verified recruiters on TalentTap AI. Sign in or create a company account to view their full experience and contact them.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Link to="/register" className="rounded-full bg-primary px-8 py-3 font-semibold text-white shadow-md hover:bg-primary/90 transition-all">
                  Create Employer Account
                </Link>
                <Link to="/login" className="rounded-full border px-8 py-3 font-semibold hover:bg-slate-50 transition-colors">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Public Header */}
            <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
              <div className="h-32 bg-slate-100 relative">
                {profile?.banner_image ? (
                  <img src={getImageUrl(profile.banner_image)} alt="Banner" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-primary/20 to-blue-500/20" />
                )}
              </div>
              <div className="px-8 pb-8">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                    <div className="-mt-16 relative z-10 flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-white shadow-md overflow-hidden shrink-0">
                      <ProfileAvatar name={profile?.user_name} src={profile?.avatar} size="xl" className="h-full w-full" />
                    </div>
                    <div className="pb-1">
                      <h1 className="text-3xl font-bold">{profile?.user_name}</h1>
                      <p className="text-lg text-muted-foreground">{profile?.headline || 'Professional'}</p>
                    </div>
                  </div>
                  <Link to="/register" className="shrink-0 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 shadow-md transition-all">
                    Sign in to Contact
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap gap-4 border-t pt-6 text-sm text-muted-foreground">
                  {profile?.city && profile?.country && (
                    <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {profile.city}, {profile.country}</div>
                  )}
                  {profile?.employment_status && (
                    <div className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {profile.employment_status.replace('_', ' ')}</div>
                  )}
                  {profile?.availability && (
                    <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Available: {profile.availability.replace('_', ' ')}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Skills */}
            {profile?.skills?.length > 0 && (
              <div className="rounded-3xl border bg-white p-8 shadow-sm">
                <h2 className="text-xl font-bold mb-6">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(s => (
                    <span key={s.id} className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-700">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {profile?.experiences?.length > 0 && (
              <div className="rounded-3xl border bg-white p-8 shadow-sm">
                <h2 className="text-xl font-bold mb-6">Experience</h2>
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {profile.experiences.map((exp, i) => (
                    <div key={exp.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      {/* Timeline dot */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      {/* Content */}
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-slate-900">{exp.title}</h3>
                        </div>
                        <p className="font-medium text-primary mb-2">{exp.company_name}</p>
                        <p className="text-xs text-muted-foreground mb-3">{exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  )
}
