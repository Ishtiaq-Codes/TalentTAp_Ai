import { useFetch } from '@/hooks/useFetch'
import { matchingAPI } from '@/api/matching'
import EmptyState from '@/components/common/EmptyState'
import MatchScoreBadge from '@/components/common/MatchScoreBadge'
import SkeletonCard from '@/components/common/SkeletonCard'
import { Sparkles, MapPin, Briefcase } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function MatchesPage() {
  const { data: matches, loading } = useFetch(() => matchingAPI.getCandidateMatches())

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>

  const matchList = Array.isArray(matches) ? matches : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your Matches</h1>
        <p className="text-muted-foreground">Jobs ranked by AI compatibility score.</p>
      </div>

      {/* Premium AI Explanation Box */}
      <div className="relative overflow-hidden rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 p-5 shadow-sm">
        <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-2xl" />
        <div className="flex items-start gap-3 relative z-10">
          <div className="mt-0.5 rounded-lg bg-indigo-100 p-2 text-indigo-600 shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Maximize Your Match Score</h4>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 max-w-2xl">
              TalentTap AI dynamically matches you to jobs by analyzing your holistic profile. To get the highest scores and appear at the top of recruiter search results, ensure your 
              <span className="font-semibold text-slate-700"> Skills, Years of Experience, Location, and Work Preferences </span> 
              are fully detailed and up-to-date!
            </p>
          </div>
        </div>
      </div>

      {matchList.length === 0 ? (
        <EmptyState icon={Sparkles} title="No matches yet" description="Complete your profile and add skills to get matched with jobs." />
      ) : (
        <div className="space-y-4">
          {matchList.map((match) => (
            <div key={match.id} className="group flex items-center gap-6 rounded-xl border bg-card p-6 transition-all hover:shadow-md hover:border-primary/30 relative">
              <MatchScoreBadge score={match.overall_score} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  <Link to={`/candidate/jobs/${match.job}`} className="hover:underline">{match.job_title}</Link>
                </h3>
                <p className="text-sm text-muted-foreground">{match.company_name}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {match.job_location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {match.job_location}</span>}
                  {match.job_type && <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {match.job_type}</span>}
                </div>
                {/* Score breakdown */}
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {[
                    { label: 'Skills', score: match.skill_score },
                    { label: 'Experience', score: match.experience_score },
                    { label: 'Location', score: match.location_score },
                    { label: 'Availability', score: match.availability_score },
                    { label: 'Job Type', score: match.employment_type_score },
                  ].map(({ label, score }) => (
                    <div key={label} className="text-center">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-ai" style={{ width: `${score || 0}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
