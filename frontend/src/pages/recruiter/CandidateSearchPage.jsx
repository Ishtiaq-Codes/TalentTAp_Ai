import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFetch } from '@/hooks/useFetch'
import { useDebounce } from '@/hooks/useDebounce'
import { candidatesAPI } from '@/api/candidates'
import EmptyState from '@/components/common/EmptyState'
import SkeletonCard from '@/components/common/SkeletonCard'
import ShortlistButton from '@/components/common/ShortlistButton'
import MessageButton from '@/components/common/MessageButton'
import { Search, MapPin, Award, Clock, User, Sparkles } from 'lucide-react'

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
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Talent Discovery</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Search our global talent pool or let our AI engine match you with top candidates perfectly suited for your roles.
        </p>
      </div>

      {/* Advanced Search Bar */}
      <div className="rounded-2xl border bg-white p-2 shadow-sm flex flex-col gap-2 sm:flex-row focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search by role, skills, headline..."
            className="w-full bg-transparent py-3 pl-12 pr-4 text-sm focus:outline-none" 
          />
        </div>
        <div className="hidden sm:block w-px bg-border my-2" />
        <select 
          onChange={(e) => setFilters({ ...filters, availability: e.target.value || undefined })}
          className="border-none bg-transparent px-4 py-3 text-sm focus:ring-0 cursor-pointer text-muted-foreground"
        >
          <option value="">Any Availability</option>
          <option value="immediate">Immediate Start</option>
          <option value="2_weeks">Within 2 Weeks</option>
          <option value="1_month">Within 1 Month</option>
        </select>
        <button className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary/90 transition-all shrink-0">
          Find Talent
        </button>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : list.length === 0 ? (
        <EmptyState 
          icon={Search} 
          title="No candidates found" 
          description="Try broadening your search terms or adjusting filters to see more results." 
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <div key={c.id} className="group relative flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:border-primary/40 hover:-translate-y-1">
              <Link to={`/recruiter/candidates/${c.id}`} className="absolute inset-0 z-0" aria-label={`View ${c.user__first_name}'s profile`} />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-100 bg-slate-50 overflow-hidden shadow-sm">
                    {c.avatar ? (
                      <img src={c.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-slate-300" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <ShortlistButton candidateId={c.id} />
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                    {c.user__first_name || c.first_name} {c.user__last_name || c.last_name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{c.headline}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-600">
                  {(c.city || c.country) && (
                    <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {c.city || c.country}</span>
                  )}
                  {c.years_of_experience && (
                    <span className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-slate-400" /> {c.years_of_experience} yrs exp</span>
                  )}
                  {c.availability && (
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" /> {c.availability?.replace('_', ' ')}</span>
                  )}
                </div>

                {c.skills?.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {c.skills.slice(0, 4).map((s, i) => (
                      <span key={i} className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                        {s.name || s}
                      </span>
                    ))}
                    {c.skills.length > 4 && (
                      <span className="rounded-md bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        +{c.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="relative z-10 mt-6 pt-5 border-t flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  <Sparkles className="h-3 w-3" /> AI Ready
                </span>
                <MessageButton recipientId={c.user_id} name={`${c.user__first_name || c.first_name}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
