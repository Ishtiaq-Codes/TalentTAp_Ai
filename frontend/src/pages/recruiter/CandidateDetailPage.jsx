import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFetch } from '@/hooks/useFetch'
import { candidatesAPI } from '@/api/candidates'
import { applicationsAPI } from '@/api/applications'
import { companiesAPI } from '@/api/companies'
import {
  MapPin, Briefcase, Calendar, User, ArrowLeft, FileText,
  Clock, Award, Globe, ExternalLink, Sparkles,
  Mail, Phone, CheckCircle,
} from 'lucide-react'
import SkeletonCard from '@/components/common/SkeletonCard'
import MessageButton from '@/components/common/MessageButton'
import ShortlistButton from '@/components/common/ShortlistButton'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import AddToPoolModal from '@/components/companies/AddToPoolModal'
import { getImageUrl } from '@/lib/utils'

/* ─── Proficiency bar ─── */
function SkillBar({ name, proficiency }) {
  const levels = { beginner: 25, intermediate: 50, advanced: 75, expert: 100 }
  const pct = levels[proficiency] || 50
  const colors = {
    beginner: 'bg-slate-400',
    intermediate: 'bg-blue-500',
    advanced: 'bg-primary',
    expert: 'bg-emerald-500',
  }
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-slate-700 w-32 shrink-0 truncate">{name}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colors[proficiency] || 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-20 text-right shrink-0 capitalize">
        {proficiency}
      </span>
    </div>
  )
}

/* ─── Profile Strength ─── */
function ProfileStrength({ completion }) {
  const tiers = [
    { min: 0, label: 'Starter', color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-500/20', bar: 'bg-red-500' },
    { min: 31, label: 'Growing', color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-500/20', bar: 'bg-amber-500' },
    { min: 61, label: 'Strong', color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-500/20', bar: 'bg-blue-500' },
    { min: 81, label: 'Outstanding', color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-500/20', bar: 'bg-emerald-500' },
  ]
  const tier = [...tiers].reverse().find(t => completion >= t.min) || tiers[0]

  return (
    <div className={`rounded-xl p-4 ${tier.bg} ring-1 ring-inset ${tier.ring}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-bold uppercase tracking-wider ${tier.color}`}>{tier.label} Profile</span>
        <span className={`text-lg font-bold ${tier.color}`}>{completion}%</span>
      </div>
      <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${tier.bar}`} style={{ width: `${completion}%` }} />
      </div>
    </div>
  )
}

export default function CandidateDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(window.location.search)
  const jobId = searchParams.get('job_id')
  
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false)
  const [localIsInPool, setLocalIsInPool] = useState(false)
  const { data: profile, loading, error } = useFetch(
    () => candidatesAPI.getPublicProfile(id, jobId ? { job_id: jobId } : {}), 
    [id, jobId]
  )
  const { data: shortlists } = useFetch(() => applicationsAPI.getShortlists())
  const { data: pools } = useFetch(() => companiesAPI.getPools())
  const shortlistsArray = Array.isArray(shortlists) ? shortlists : []
  const poolsArray = Array.isArray(pools) ? pools : []
  
  const isInAnyPool = localIsInPool || (profile ? poolsArray.some(p => p.member_candidate_ids?.includes(profile.id)) : false)

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

  const skillsByLevel = ['expert', 'advanced', 'intermediate', 'beginner']
    .map(level => ({
      level,
      skills: (profile.skills || []).filter(s => s.proficiency === level),
    }))
    .filter(g => g.skills.length > 0)

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Search
      </button>

      {/* ─── Profile Header ─── */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="h-48 bg-slate-100 relative">
          {profile.banner_image ? (
            <img src={getImageUrl(profile.banner_image)} alt="Banner" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800" />
          )}
        </div>
        <div className="px-6 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            <div className="-mt-14 relative z-10 flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden shrink-0">
              <ProfileAvatar name={profile.user_name} src={profile.avatar} size="xl" className="h-full w-full" />
            </div>
            <div className="flex-1 pb-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{profile.user_name}</h1>
                  <p className="text-base text-muted-foreground mt-0.5">{profile.headline || 'Professional'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <MessageButton recipientId={profile.user} name={profile.user_name} className="text-sm" />
                  <ShortlistButton 
                    candidateId={profile.id} 
                    initialIsShortlisted={shortlistsArray.some(s => s.candidate === profile.id)}
                    className="text-sm" 
                  />
                  {isInAnyPool ? (
                    <button 
                      disabled
                      className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium bg-ai/10 text-ai border-ai/20"
                    >
                      <Sparkles className="h-4 w-4" /> In Pool
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsPoolModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
                    >
                      <Sparkles className="h-4 w-4 text-ai" /> Add to Pool
                    </button>
                  )}
                  {profile.resume && (
                    <a href={profile.resume} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all">
                      <FileText className="h-4 w-4" /> Resume
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Meta badges */}
          <div className="mt-5 flex flex-wrap gap-3 border-t pt-5">
            {profile.city && profile.country && (
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-600"><MapPin className="h-4 w-4 text-slate-400" /> {profile.city}, {profile.country}</span>
            )}
            {profile.years_of_experience > 0 && (
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-600"><Award className="h-4 w-4 text-slate-400" /> {profile.years_of_experience} years experience</span>
            )}
            {profile.availability && (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                profile.availability === 'immediate' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
              }`}>
                <Clock className="h-3 w-3" /> {profile.availability.replace(/_/g, ' ')}
              </span>
            )}
            {profile.employment_status && (
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-600"><Briefcase className="h-4 w-4 text-slate-400" /> {profile.employment_status.replace(/_/g, ' ')}</span>
            )}
            {profile.employment_type_preferred && (
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-600"><Briefcase className="h-4 w-4 text-slate-400" /> Prefers {profile.employment_type_preferred.replace(/_/g, ' ')}</span>
            )}
            {profile.salary_min && profile.salary_max && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {profile.salary_currency} {Number(profile.salary_min).toLocaleString()} – {Number(profile.salary_max).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ─── Main Content ─── */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Decision Layer Insight */}
          {(profile.match_reason || profile.skills?.length > 0 || profile.years_of_experience > 0) && (
            <div className="rounded-2xl border border-ai/20 bg-gradient-to-r from-ai/5 to-transparent p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Sparkles className="h-24 w-24 text-ai" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-ai" />
                <h2 className="text-base font-bold text-slate-900">AI Semantic Match Insight</h2>
                {profile.ranking_score && (
                  <span className="ml-auto inline-flex items-center rounded-full bg-ai/10 px-2.5 py-0.5 text-xs font-semibold text-ai">
                    {profile.ranking_score.toFixed(0)} Score
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed max-w-2xl mb-4">
                {profile.match_reason ? (
                  profile.match_reason
                ) : (
                  <>
                    TalentTap AI identifies this candidate as a strong prospect. 
                    {profile.years_of_experience > 0 && ` They bring ${profile.years_of_experience} years of professional experience, `}
                    {profile.skills?.length > 0 && `anchored by core competencies in ${profile.skills.slice(0, 3).map(s => typeof s === 'string' ? s : s.name).join(', ')}.`}
                    {profile.is_open_to_work && " Crucially, they are currently open to new opportunities and likely to respond quickly."}
                  </>
                )}
              </p>
              
              {/* Detailed Context Factors */}
              {((profile.relevance_factors && profile.relevance_factors.length > 0) || (profile.missing_factors && profile.missing_factors.length > 0)) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-ai/10">
                  {profile.relevance_factors && profile.relevance_factors.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Matched Criteria</h3>
                      <ul className="space-y-1">
                        {profile.relevance_factors.map((factor, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-emerald-500 mt-0.5">✓</span> {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {profile.missing_factors && profile.missing_factors.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider">Missing Requirements</h3>
                      <ul className="space-y-1">
                        {profile.missing_factors.map((factor, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-red-500 mt-0.5">✕</span> {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* About */}
          {profile.about && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-3">About</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{profile.about}</p>
            </div>
          )}

          {/* Career Goals */}
          {profile.career_goals && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-3">Career Goals</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{profile.career_goals}</p>
            </div>
          )}

          {/* Skills */}
          {profile.skills?.length > 0 && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4">Skills & Expertise</h2>
              <div className="space-y-5">
                {skillsByLevel.map(({ level, skills }) => (
                  <div key={level}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        level === 'expert' ? 'bg-emerald-50 text-emerald-700' :
                        level === 'advanced' ? 'bg-primary/10 text-primary' :
                        level === 'intermediate' ? 'bg-blue-50 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{level}</span>
                    </div>
                    <div className="space-y-2.5">
                      {skills.map(s => (
                        <SkillBar key={s.id} name={s.name} proficiency={s.proficiency} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience Timeline */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-5">Work Experience</h2>
            {profile.experiences?.length > 0 ? (
              <div className="relative space-y-6 pl-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {profile.experiences.map((exp) => (
                  <div key={exp.id} className="relative">
                    <div className="absolute -left-6 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-primary bg-white z-10" />
                    <div className="rounded-xl border border-slate-100 p-4 hover:shadow-sm transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <h3 className="font-bold text-slate-900">{exp.title}</h3>
                        <span className="text-xs text-slate-400 shrink-0">{exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}</span>
                      </div>
                      <p className="font-medium text-primary text-sm mt-0.5">{exp.company_name}</p>
                      {exp.description && (
                        <p className="text-sm text-slate-600 leading-relaxed mt-3">{exp.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No experience listed.</p>
            )}
          </div>

          {/* Education */}
          {profile.education?.length > 0 && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-5">Education</h2>
              <div className="relative space-y-6 pl-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {profile.education.map((edu) => (
                  <div key={edu.id} className="relative">
                    <div className="absolute -left-6 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-primary bg-white z-10" />
                    <div className="rounded-xl border border-slate-100 p-4 hover:shadow-sm transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <h3 className="font-bold text-slate-900">{edu.degree}</h3>
                        <span className="text-xs text-slate-400 shrink-0">{edu.start_date} — {edu.end_date || 'Present'}</span>
                      </div>
                      <p className="font-medium text-primary text-sm mt-0.5">{edu.institution_name}</p>
                      {edu.field_of_study && <p className="text-sm font-medium text-slate-700 mt-2">Field of Study: {edu.field_of_study}</p>}
                      {edu.description && <p className="text-sm text-slate-600 leading-relaxed mt-2">{edu.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {profile.certifications?.length > 0 && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4">Certifications</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.certifications.map((cert) => (
                  <div key={cert.id} className="rounded-xl border border-slate-100 p-4 hover:shadow-sm transition-shadow bg-slate-50/50">
                    <h3 className="font-bold text-slate-900">{cert.name}</h3>
                    <p className="font-medium text-primary text-sm mt-0.5">{cert.issuing_organization}</p>
                    {cert.issue_date && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Issued {cert.issue_date} {cert.expiration_date ? `· Expires ${cert.expiration_date}` : ''}
                      </p>
                    )}
                    {(cert.credential_id || cert.credential_url) && (
                      <div className="mt-3 flex flex-wrap gap-3 text-sm">
                        {cert.credential_id && <span className="text-slate-600 font-mono text-xs bg-white border px-2 py-1 rounded">ID: {cert.credential_id}</span>}
                        {cert.credential_url && (
                          <a href={cert.credential_url} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 text-xs bg-white border px-2 py-1 rounded">
                            Verify <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── Sidebar ─── */}
        <div className="space-y-5">
          {/* Profile Strength */}
          {profile.profile_completion != null && (
            <ProfileStrength completion={profile.profile_completion} />
          )}

          {/* Profile Insights */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Profile Insights</h2>
            <div className="space-y-3">
              {profile.skills?.length > 0 && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{profile.skills.length} Skills Listed</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Top: {profile.skills.slice(0, 3).map(s => s.name).join(', ')}</p>
                  </div>
                </div>
              )}
              {profile.experiences?.length > 0 && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{profile.experiences.length} Roles</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Latest: {profile.experiences[0]?.title} at {profile.experiences[0]?.company_name}</p>
                  </div>
                </div>
              )}
              {profile.resume && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-xs font-semibold text-slate-700">Resume Uploaded</p>
                </div>
              )}
              {profile.years_of_experience > 0 && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-xs font-semibold text-slate-700">{profile.years_of_experience} Years Experience</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Contact</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-slate-700 truncate">{profile.user_email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-slate-700">{profile.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Links */}
          {(profile.github_url || profile.linkedin_url || profile.portfolio_url) && (
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-4">Links</h2>
              <div className="space-y-2">
                {profile.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <Globe className="h-4 w-4 text-slate-400" /> GitHub <ExternalLink className="h-3 w-3 ml-auto text-slate-300" />
                  </a>
                )}
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <Globe className="h-4 w-4 text-slate-400" /> LinkedIn <ExternalLink className="h-3 w-3 ml-auto text-slate-300" />
                  </a>
                )}
                {profile.portfolio_url && (
                  <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <Globe className="h-4 w-4 text-slate-400" /> Portfolio <ExternalLink className="h-3 w-3 ml-auto text-slate-300" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isPoolModalOpen && (
        <AddToPoolModal 
          isOpen={isPoolModalOpen} 
          onClose={() => setIsPoolModalOpen(false)} 
          candidateId={profile.id} 
          candidateName={profile.user_name} 
          onSuccess={() => setLocalIsInPool(true)}
        />
      )}
    </div>
  )
}
