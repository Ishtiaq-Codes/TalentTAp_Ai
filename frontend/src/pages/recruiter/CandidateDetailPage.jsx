import { useParams, useNavigate } from 'react-router-dom'
import { useFetch } from '@/hooks/useFetch'
import { candidatesAPI } from '@/api/candidates'
import { MapPin, Briefcase, Calendar, User, ArrowLeft, FileText } from 'lucide-react'
import SkeletonCard from '@/components/common/SkeletonCard'
import MessageButton from '@/components/common/MessageButton'
import ShortlistButton from '@/components/common/ShortlistButton'

export default function CandidateDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: profile, loading, error } = useFetch(() => candidatesAPI.getPublicProfile(id))

  if (loading) return <div className="space-y-6"><SkeletonCard /><SkeletonCard /></div>
  
  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center bg-white">
        <User className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold">Candidate Not Found</h3>
        <p className="mt-1 text-sm text-muted-foreground">The candidate profile you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate(-1)} className="mt-6 rounded-full bg-slate-100 px-6 py-2 text-sm font-semibold hover:bg-slate-200 transition-colors">
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Search
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
            <div className="h-32 bg-gradient-to-r from-primary/20 to-blue-500/20" />
            <div className="px-8 pb-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="-mt-12 flex items-end gap-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white shadow-md overflow-hidden shrink-0">
                    {profile.user?.avatar ? (
                      <img src={profile.user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-slate-300" />
                    )}
                  </div>
                  <div className="mb-2">
                    <h1 className="text-2xl font-bold">{profile.user?.first_name} {profile.user?.last_name}</h1>
                    <p className="text-muted-foreground">{profile.headline || 'Professional'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 border-t pt-6 text-sm text-muted-foreground">
                {profile.city && profile.country && (
                  <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {profile.city}, {profile.country}</div>
                )}
                {profile.employment_status && (
                  <div className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {profile.employment_status.replace('_', ' ')}</div>
                )}
                {profile.availability && (
                  <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {profile.availability.replace('_', ' ')}</div>
                )}
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="text-lg font-bold mb-6">Work Experience</h2>
            {profile.experiences?.length > 0 ? (
              <div className="space-y-6">
                {profile.experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-primary">
                    <h3 className="font-bold text-slate-900">{exp.title}</h3>
                    <p className="font-medium text-primary text-sm">{exp.company_name}</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-2">{exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No experience listed.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-3">
            <MessageButton recipientId={profile.user?.id} name={profile.user?.first_name} className="w-full justify-center py-3 text-sm border-primary text-primary" />
            <ShortlistButton candidateId={profile.id} className="w-full justify-center py-3 text-sm" />
            {profile.resume && (
              <a href={profile.resume} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold text-primary hover:bg-slate-50 transition-all">
                <FileText className="h-4 w-4" /> View Resume
              </a>
            )}
          </div>

          {/* Contact Info */}
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="font-bold mb-4">Contact Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Email</p>
                <p className="font-medium">{profile.user?.email}</p>
              </div>
              {profile.github_url && (
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">GitHub</p>
                  <a href={profile.github_url} className="font-medium text-primary hover:underline">{profile.github_url}</a>
                </div>
              )}
              {profile.linkedin_url && (
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">LinkedIn</p>
                  <a href={profile.linkedin_url} className="font-medium text-primary hover:underline">{profile.linkedin_url}</a>
                </div>
              )}
              {profile.portfolio_url && (
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Portfolio</p>
                  <a href={profile.portfolio_url} className="font-medium text-primary hover:underline">{profile.portfolio_url}</a>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {profile.skills?.length > 0 && (
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h2 className="font-bold mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(s => (
                  <span key={s.id} className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
