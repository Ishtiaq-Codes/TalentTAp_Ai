import { useParams, useNavigate, Link } from 'react-router-dom'
import { useFetch } from '@/hooks/useFetch'
import { candidatesAPI } from '@/api/candidates'
import { useAuth } from '@/contexts/AuthContext'
import { getImageUrl } from '@/lib/utils'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import PublicNavbar from '@/components/layout/PublicNavbar'
import Footer from '@/components/layout/Footer'
import { MapPin, Briefcase, Calendar, Lock, ArrowRight, User, Clock, Award, Globe, ExternalLink } from 'lucide-react'

/* ─── Skill proficiency dots ─── */
function ProficiencyDots({ level }) {
  const levels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 }
  const n = levels[level] || 2
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4].map(i => (
        <div key={i} className={`h-1.5 w-3 rounded-full ${i <= n ? 'bg-primary' : 'bg-slate-200'}`} />
      ))}
    </div>
  )
}

/* ─── Profile Strength Badge ─── */
function ProfileBadge({ completion }) {
  const tiers = [
    { min: 0, label: 'Starter', color: 'bg-red-50 text-red-700 ring-red-600/20' },
    { min: 31, label: 'Growing', color: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
    { min: 61, label: 'Strong', color: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
    { min: 81, label: 'Outstanding', color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  ]
  const tier = [...tiers].reverse().find(t => completion >= t.min) || tiers[0]
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset uppercase tracking-wider ${tier.color}`}>
      {tier.label}
    </span>
  )
}

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
            <div className="h-64 rounded-2xl bg-slate-200" />
            <div className="h-40 rounded-2xl bg-slate-200" />
          </div>
        ) : isGated || error ? (
          <div className="overflow-hidden rounded-2xl border bg-white shadow-xl">
            <div className="h-40 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900" />
            <div className="px-8 pb-12 text-center">
              <div className="mx-auto -mt-16 mb-6 flex h-32 w-32 items-center justify-center rounded-2xl border-4 border-white bg-slate-100 shadow-lg">
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
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="h-44 bg-slate-100 relative">
                {profile?.banner_image ? (
                  <img src={getImageUrl(profile.banner_image)} alt="Banner" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800" />
                )}
              </div>
              <div className="px-6 sm:px-8 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                    <div className="-mt-14 relative z-10 flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden shrink-0">
                      <ProfileAvatar name={profile?.user_name} src={profile?.avatar} size="xl" className="h-full w-full" />
                    </div>
                    <div className="pb-1">
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">{profile?.user_name}</h1>
                        {profile?.profile_completion != null && <ProfileBadge completion={profile.profile_completion} />}
                      </div>
                      <p className="text-base text-muted-foreground mt-0.5">{profile?.headline || 'Professional'}</p>
                    </div>
                  </div>
                  <Link to="/register" className="shrink-0 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 shadow-md transition-all">
                    Sign in to Contact
                  </Link>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 border-t pt-5 text-sm text-muted-foreground">
                  {profile?.city && profile?.country && (
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-slate-400" /> {profile.city}, {profile.country}</span>
                  )}
                  {profile?.years_of_experience > 0 && (
                    <span className="flex items-center gap-1.5"><Award className="h-4 w-4 text-slate-400" /> {profile.years_of_experience} years exp</span>
                  )}
                  {profile?.employment_status && (
                    <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-slate-400" /> {profile.employment_status.replace(/_/g, ' ')}</span>
                  )}
                  {profile?.availability && (
                    <span className={`flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold ${
                      profile.availability === 'immediate' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      <Clock className="h-3 w-3" /> {profile.availability.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Skills */}
            {profile?.skills?.length > 0 && (
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold mb-4">Skills & Expertise</h2>
                <div className="space-y-2.5">
                  {profile.skills.map(s => (
                    <div key={s.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">{s.name}</span>
                      <div className="flex items-center gap-3">
                        <ProficiencyDots level={s.proficiency} />
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-20 text-right capitalize">{s.proficiency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {profile?.experiences?.length > 0 && (
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold mb-5">Experience</h2>
                <div className="relative space-y-5 pl-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {profile.experiences.map((exp) => (
                    <div key={exp.id} className="relative">
                      <div className="absolute -left-6 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-primary bg-white z-10" />
                      <div className="rounded-xl border border-slate-100 p-4 hover:shadow-sm transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <h3 className="font-bold text-slate-900">{exp.title}</h3>
                          <span className="text-xs text-slate-400">{exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}</span>
                        </div>
                        <p className="font-medium text-primary text-sm mt-0.5">{exp.company_name}</p>
                        {exp.description && <p className="text-sm text-slate-600 leading-relaxed mt-3">{exp.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {(profile?.github_url || profile?.linkedin_url || profile?.portfolio_url) && (
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold mb-4">Links</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                      <Globe className="h-4 w-4 text-slate-400" /> GitHub <ExternalLink className="h-3 w-3 text-slate-300" />
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                      <Globe className="h-4 w-4 text-slate-400" /> LinkedIn <ExternalLink className="h-3 w-3 text-slate-300" />
                    </a>
                  )}
                  {profile.portfolio_url && (
                    <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                      <Globe className="h-4 w-4 text-slate-400" /> Portfolio <ExternalLink className="h-3 w-3 text-slate-300" />
                    </a>
                  )}
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
