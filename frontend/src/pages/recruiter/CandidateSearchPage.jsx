import { useState } from 'react'
import { useFetch } from '@/hooks/useFetch'
import { useDebounce } from '@/hooks/useDebounce'
import { candidatesAPI } from '@/api/candidates'
import EmptyState from '@/components/common/EmptyState'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import SkeletonCard from '@/components/common/SkeletonCard'
import ShortlistButton from '@/components/common/ShortlistButton'
import MessageButton from '@/components/common/MessageButton'
import { Search, MapPin, Award, Clock } from 'lucide-react'

export default function CandidateSearchPage() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})
  const debounced = useDebounce(search)
  const { data: candidates, loading } = useFetch(
    () => candidatesAPI.search({ search: debounced, ...filters }),
    [debounced, filters],
  )

  const list = Array.isArray(candidates) ? candidates : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Find Candidates</h1>
        <p className="text-muted-foreground">Search and discover talent across the platform.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by skills, headline, location..."
            className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none" />
        </div>
        <select onChange={(e) => setFilters({ ...filters, availability: e.target.value || undefined })}
          className="rounded-lg border bg-background px-4 py-2.5 text-sm">
          <option value="">All Availability</option>
          <option value="immediate">Immediate</option>
          <option value="2_weeks">2 Weeks</option>
          <option value="1_month">1 Month</option>
        </select>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : list.length === 0 ? (
        <EmptyState icon={Search} title="No candidates found" description="Try different search terms or filters." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((c) => (
            <div key={c.id} className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
              <div className="flex items-start gap-3">
                <ProfileAvatar name={`${c.user__first_name || c.first_name || ''} ${c.user__last_name || c.last_name || ''}`} size="md" />
                <div className="flex-1 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{c.user__first_name || c.first_name} {c.user__last_name || c.last_name}</h3>
                    <p className="text-sm text-muted-foreground">{c.headline}</p>
                  </div>
                  <div className="flex gap-2">
                    <MessageButton recipientId={c.user_id} name={`${c.user__first_name || c.first_name} ${c.user__last_name || c.last_name}`} />
                    <ShortlistButton candidateId={c.id} />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {(c.city || c.country) && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.city || c.country}</span>}
                {c.years_of_experience && <span className="inline-flex items-center gap-1"><Award className="h-3 w-3" /> {c.years_of_experience} yrs</span>}
                {c.availability && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {c.availability?.replace('_', ' ')}</span>}
              </div>
              {c.skills?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {c.skills.slice(0, 5).map((s, i) => (
                    <span key={i} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{s.name || s}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
