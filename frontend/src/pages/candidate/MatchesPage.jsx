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
                        <div className="h-full rounded-full bg-primary" style={{ width: `${score || 0}%` }} />
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
