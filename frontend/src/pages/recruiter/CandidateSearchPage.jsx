import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useFetch } from '@/hooks/useFetch'
import { useDebounce } from '@/hooks/useDebounce'
import { candidatesAPI } from '@/api/candidates'
import { jobsAPI } from '@/api/jobs'
import EmptyState from '@/components/common/EmptyState'
import SkeletonCard from '@/components/common/SkeletonCard'
import ShortlistButton from '@/components/common/ShortlistButton'
import MessageButton from '@/components/common/MessageButton'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import { getImageUrl } from '@/lib/utils'
import {
 Search, MapPin, Award, Clock, Sparkles, X, ChevronRight,
 Briefcase, Filter, ArrowRight, ExternalLink, FileText, Globe,
 SlidersHorizontal, User,
} from 'lucide-react'

/* ─── Proficiency bar ─── */
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

/* ─── Availability badge ─── */
function AvailabilityBadge({ availability }) {
 if (!availability) return null
 const colors = {
  immediate: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  '2_weeks': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  '1_month': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  '3_months': 'bg-orange-50 text-orange-700 ring-orange-600/20',
  not_available: 'bg-red-50 text-red-700 ring-red-600/20',
 }
 return (
  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset uppercase tracking-wider ${colors[availability] || 'bg-slate-50 text-slate-600 ring-slate-600/20'}`}>
   <Clock className="h-2.5 w-2.5"/>
   {availability?.replace(/_/g, ' ')}
  </span>
 )
}

export default function CandidateSearchPage() {
 const [search, setSearch] = useState('')
 const [filters, setFilters] = useState({})
 const [selectedId, setSelectedId] = useState(null)
 const [showFilters, setShowFilters] = useState(false)
 const [selectedJobId, setSelectedJobId] = useState('')
 const debounced = useDebounce(search)
 const [focusedIndex, setFocusedIndex] = useState(-1)
 
 const { data: jobsResp } = useFetch(() => jobsAPI.list(), [])
 const myJobs = jobsResp?.results || (Array.isArray(jobsResp) ? jobsResp : [])

 const { data: candidates, loading } = useFetch(
  () => candidatesAPI.search({ search: debounced, job_id: selectedJobId || undefined, ...filters }),
  [debounced, filters, selectedJobId],
 )

 const list = Array.isArray(candidates) ? candidates : []
 const selected = list.find(c => c.id === selectedId)

 // Keyboard Navigation System
 useEffect(() => {
  const handleKeyDown = (e) => {
   // Don't trigger if typing in an input
   if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return

   if (e.key === 'j' || e.key === 'ArrowDown') {
    e.preventDefault()
    setFocusedIndex(prev => (prev < list.length - 1 ? prev + 1 : prev))
   } else if (e.key === 'k' || e.key === 'ArrowUp') {
    e.preventDefault()
    setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0))
   } else if (e.key === 'Enter') {
    if (focusedIndex >= 0 && focusedIndex < list.length) {
     e.preventDefault()
     setSelectedId(list[focusedIndex].id)
    }
   } else if (e.key === 'Escape') {
    e.preventDefault()
    setSelectedId(null)
   } else if (e.key === 's' || e.key === 'S') {
    e.preventDefault()
    const targetId = selectedId || (focusedIndex >= 0 ? list[focusedIndex]?.id : null)
    if (targetId) {
     const wrapper = document.getElementById(`shortlist-btn-${targetId}`)
     if (wrapper) {
      const btn = wrapper.querySelector('button')
      if (btn) btn.click()
     }
    }
   }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
 }, [list, focusedIndex, selectedId])

 // Scroll focused element into view
 useEffect(() => {
  if (focusedIndex >= 0 && list[focusedIndex]) {
   const el = document.getElementById(`candidate-item-${list[focusedIndex].id}`)
   if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
   }
  }
 }, [focusedIndex, list])

 const clearFilters = () => {
  setFilters({})
  setSearch('')
 }

 const activeFilterCount = Object.values(filters).filter(Boolean).length

 return (
  <div className="flex flex-col h-[calc(100vh-5.5rem)] sm:h-[calc(100vh-6.5rem)] lg:h-[calc(100vh-7rem)] animate-fade-in">
   {/* Top Bar */}
   <div className="shrink-0 pb-3">
    <div className="flex items-center justify-between gap-4">
     <div>
      <h1 className="text-2xl font-bold tracking-tight">Talent Discovery</h1>
      <p className="mt-1 text-sm text-muted-foreground">
       {list.length} candidate{list.length !== 1 ? 's' : ''} found
      </p>
     </div>
     <button
      onClick={() => setShowFilters(!showFilters)}
      className="lg:hidden inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50 transition-colors"
     >
      <SlidersHorizontal className="h-4 w-4"/>
      Filters
      {activeFilterCount > 0 && (
       <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">{activeFilterCount}</span>
      )}
     </button>
    </div>
    
    {/* Match Context Dropdown */}
    <div className="mt-4 flex items-center gap-3">
     <Sparkles className="h-4 w-4 text-ai"/>
     <span className="text-sm font-medium text-slate-700">AI Match Context:</span>
     <select
      value={selectedJobId}
      onChange={(e) => setSelectedJobId(e.target.value)}
      className="flex-1 max-w-xs rounded-lg border-slate-200 text-sm focus:border-ai focus:ring-ai shadow-sm"
     >
      <option value="">Global Organic Ranking</option>
      {myJobs.map(job => (
       <option key={job.id} value={job.id}>Match vs. {job.title}</option>
      ))}
     </select>
    </div>
   </div>

   {/* 3-Panel Layout */}
   <div className="flex flex-1 gap-4 min-h-0 overflow-hidden">

    {/* LEFT: Filters */}
    <aside 
     className={`${showFilters ? 'fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:relative lg:bg-transparent lg:backdrop-blur-none' : 'hidden'} lg:block lg:w-64 shrink-0`}
     onClick={() => setShowFilters(false)}
    >
     <div 
      onClick={(e) => e.stopPropagation()}
      className={`${showFilters ? 'absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl lg:relative lg:w-auto lg:shadow-none' : ''} flex flex-col h-full overflow-hidden glass-card rounded-xl`}
     >
      <div className="flex-1 overflow-y-auto">
       {/* Filter header */}
      <div className="flex items-center justify-between p-4 border-b">
       <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-primary"/>
        <h2 className="text-sm font-semibold">Filters</h2>
       </div>
       <div className="flex items-center gap-2">
        {activeFilterCount > 0 && (
         <button onClick={clearFilters} className="text-xs text-primary font-medium hover:underline">Clear all</button>
        )}
        <button onClick={() => setShowFilters(false)} className="lg:hidden p-1 rounded hover:bg-slate-100">
         <X className="h-4 w-4"/>
        </button>
       </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
       <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search</label>
       <div className="relative mt-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
        <input
         value={search}
         onChange={(e) => setSearch(e.target.value)}
         placeholder="Name, skills, role..."
         className="w-full rounded-lg border bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
        />
       </div>
      </div>

      {/* Location */}
      <div className="p-4 border-b">
       <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</label>
       <div className="mt-3 space-y-3">
        <div className="relative">
         <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
         <input
          value={filters.city || ''}
          onChange={(e) => setFilters({ ...filters, city: e.target.value || undefined })}
          placeholder="City (e.g. London)"
          className="w-full rounded-lg border bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
         />
        </div>
        <div className="relative">
         <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
         <input
          value={filters.country || ''}
          onChange={(e) => setFilters({ ...filters, country: e.target.value || undefined })}
          placeholder="Country (e.g. UK)"
          className="w-full rounded-lg border bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
         />
        </div>
       </div>
      </div>

      {/* Availability */}
      <div className="p-4 border-b">
       <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Availability</label>
       <div className="mt-2 space-y-1.5">
        {[
         { value: '', label: 'Any' },
         { value: 'immediate', label: 'Immediate' },
         { value: '2_weeks', label: 'Within 2 Weeks' },
         { value: '1_month', label: 'Within 1 Month' },
         { value: '3_months', label: 'Within 3 Months' },
        ].map(opt => (
         <button
          key={opt.value}
          onClick={() => setFilters({ ...filters, availability: opt.value || undefined })}
          className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
           (filters.availability || '') === opt.value
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-slate-600 hover:bg-slate-50'
          }`}
         >
          {opt.label}
         </button>
        ))}
       </div>
      </div>

      {/* Employment Type */}
      <div className="p-4 border-b">
       <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Employment Type</label>
       <div className="mt-2 space-y-1.5">
        {[
         { value: '', label: 'Any' },
         { value: 'full_time', label: 'Full Time' },
         { value: 'part_time', label: 'Part Time' },
         { value: 'contract', label: 'Contract' },
         { value: 'freelance', label: 'Freelance' },
        ].map(opt => (
         <button
          key={opt.value}
          onClick={() => setFilters({ ...filters, employment_type_preferred: opt.value || undefined })}
          className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
           (filters.employment_type_preferred || '') === opt.value
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-slate-600 hover:bg-slate-50'
          }`}
         >
          {opt.label}
         </button>
        ))}
       </div>
      </div>

      {/* Employment Status */}
      <div className="p-4">
       <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
       <div className="mt-2 space-y-1.5">
        {[
         { value: '', label: 'Any' },
         { value: 'employed', label: 'Employed' },
         { value: 'unemployed', label: 'Unemployed' },
         { value: 'freelancing', label: 'Freelancing' },
         { value: 'student', label: 'Student' },
        ].map(opt => (
         <button
          key={opt.value}
          onClick={() => setFilters({ ...filters, employment_status: opt.value || undefined })}
          className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
           (filters.employment_status || '') === opt.value
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-slate-600 hover:bg-slate-50'
          }`}
         >
          {opt.label}
         </button>
        ))}
       </div>
      </div>
      </div>
      
      {/* Mobile Apply Button */}
      {showFilters && (
       <div className="lg:hidden p-4 border-t bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] mt-auto shrink-0">
        <button 
         onClick={() => setShowFilters(false)}
         className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
         Show {list.length} Results
        </button>
       </div>
      )}
     </div>
    </aside>

    {/* CENTER: Results List */}
    <div className={`flex-1 min-w-0 flex flex-col overflow-hidden glass-card rounded-xl ${selected ? 'hidden lg:flex' : 'flex'}`}>
     {/* Results header */}
     <div className="flex flex-col border-b bg-slate-50/50">
      <div className="flex items-center justify-between px-4 py-3">
       <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidates</span>
       <span className="text-xs text-slate-400">{list.length} results</span>
      </div>
      <div className="hidden sm:flex items-center gap-4 px-4 pb-3 text-[10px] text-slate-400">
       <div className="flex items-center gap-1.5"><kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-500 shadow-sm">↑</kbd> <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-500 shadow-sm">↓</kbd> navigate</div>
       <div className="flex items-center gap-1.5"><kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-500 shadow-sm">Enter</kbd> open</div>
       <div className="flex items-center gap-1.5"><kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-500 shadow-sm">S</kbd> save</div>
       <div className="flex items-center gap-1.5"><kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-500 shadow-sm">Esc</kbd> close</div>
      </div>
     </div>

     {/* Results list */}
     <div className="flex-1 overflow-y-auto">
      {loading ? (
       <div className="p-4 space-y-3">
        {[...Array(8)].map((_, i) => (
         <div key={i} className="animate-pulse flex items-center gap-4 p-3">
          <div className="h-10 w-10 rounded-full bg-slate-200"/>
          <div className="flex-1 space-y-2">
           <div className="h-4 w-32 rounded bg-slate-200"/>
           <div className="h-3 w-48 rounded bg-slate-100"/>
          </div>
         </div>
        ))}
       </div>
      ) : list.length === 0 ? (
       <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 mb-4">
         <Search className="h-6 w-6 text-slate-400"/>
        </div>
        <h3 className="text-base font-semibold">No candidates found</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs">Try broadening your search or adjusting filters.</p>
       </div>
      ) : (
       list.map((c, idx) => (
        <button
         key={c.id}
         id={`candidate-item-${c.id}`}
         onClick={() => { setSelectedId(c.id); setFocusedIndex(idx); }}
         className={`group w-full text-left flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 transition-all hover:bg-slate-50 cursor-pointer ${
          selectedId === c.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
         } ${focusedIndex === idx && selectedId !== c.id ? 'ring-2 ring-inset ring-primary/30 bg-slate-50' : ''}`}
        >
         <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
          <ProfileAvatar name={c.user_name} src={c.avatar} size="md"className="h-full w-full"isActive={c.is_open_to_work} />
         </div>

         <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
           <h3 className="text-sm font-semibold text-slate-900 truncate">{c.user_name || 'Candidate'}</h3>
           {c.is_open_to_work && (
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 shrink-0"title="Open to work"/>
           )}
           {(c.years_of_experience >= 5 || c.is_recommended) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ai/10 px-2 py-0.5 text-[9px] font-bold text-ai uppercase tracking-wider">
             <Sparkles className="h-2.5 w-2.5"/> Top Match
            </span>
           )}
          </div>
          <p className="text-xs text-slate-500 truncate mt-0.5">{c.headline || 'Professional'}</p>
          <div className="flex items-center gap-3 mt-1.5">
           {(c.city || c.country) && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
             <MapPin className="h-2.5 w-2.5"/> {c.city || c.country}
            </span>
           )}
           {c.years_of_experience > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
             <Award className="h-2.5 w-2.5"/> {c.years_of_experience}y
            </span>
           )}
          </div>
         </div>

         <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className={`transition-opacity ${focusedIndex === idx || selectedId === c.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
           <div id={`shortlist-btn-${c.id}`} onClick={(e) => e.stopPropagation()}>
            <ShortlistButton candidateId={c.id} initialIsShortlisted={c.is_shortlisted} className="!py-1 !px-2 !text-[10px]"/>
           </div>
          </div>
          <AvailabilityBadge availability={c.availability} />
          {c.skills?.length > 0 && (
           <div className="flex gap-1">
            {c.skills.slice(0, 2).map((s, i) => (
             <span key={i} className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">{s.name || s}</span>
            ))}
            {c.skills.length > 2 && (
             <span className="rounded bg-slate-50 px-1.5 py-0.5 text-[9px] font-medium text-slate-400">+{c.skills.length - 2}</span>
            )}
           </div>
          )}
         </div>
        </button>
       ))
      )}
     </div>
    </div>

    {/* RIGHT: Preview Panel */}
    {selected && (
     <div className="fixed inset-0 z-40 lg:relative lg:z-auto lg:w-[420px] shrink-0 flex">
      {/* Mobile backdrop */}
      <div className="absolute inset-0 bg-black/40 lg:hidden"onClick={() => setSelectedId(null)} />

      <div className="relative ml-auto w-full max-w-md lg:max-w-none h-full overflow-y-auto rounded-xl border bg-white shadow-xl lg:shadow-sm flex flex-col">
       {/* Preview Header */}
       <div className="relative shrink-0">
        <div className="h-28 bg-gradient-to-r from-primary/20 to-blue-500/20">
         {selected.banner_image && (
          <img src={getImageUrl(selected.banner_image)} alt=""className="h-full w-full object-cover"/>
         )}
        </div>
        <button
         onClick={() => setSelectedId(null)}
         className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur text-slate-600 hover:bg-white transition-all shadow-sm"
        >
         <X className="h-4 w-4"/>
        </button>
        <div className="px-5 -mt-8">
         <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
          <ProfileAvatar name={selected.user_name} src={selected.avatar} size="lg"className="h-full w-full"/>
         </div>
        </div>
       </div>

       {/* Preview Body */}
       <div className="flex-1 px-5 pb-5 space-y-5">
        {/* Name & headline */}
        <div className="pt-2">
         <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">{selected.user_name}</h2>
          {selected.is_flight_risk && (
           <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
            🚀 Passive Talent
           </span>
          )}
         </div>
         <p className="text-sm text-muted-foreground">{selected.headline || 'Professional'}</p>

         <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-500">
          {(selected.city || selected.country) && (
           <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/> {selected.city}{selected.city && selected.country ? ', ' : ''}{selected.country}</span>
          )}
          {selected.years_of_experience > 0 && (
           <span className="flex items-center gap-1"><Award className="h-3 w-3"/> {selected.years_of_experience} years exp</span>
          )}
          {selected.employment_status && (
           <span className="flex items-center gap-1"><Briefcase className="h-3 w-3"/> {selected.employment_status.replace(/_/g, ' ')}</span>
          )}
         </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
         <Link
          to={`/recruiter/candidates/${selected.id}${selectedJobId ? `?job_id=${selectedJobId}` : ''}`}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-all"
         >
          View Full Profile <ArrowRight className="h-3.5 w-3.5"/>
         </Link>
         <div className="shrink-0"id={`shortlist-btn-${selected.id}`}>
          <ShortlistButton candidateId={selected.id} initialIsShortlisted={selected.is_shortlisted} />
         </div>
        </div>

        <div className="flex gap-2">
         <MessageButton recipientId={selected.user_id} name={selected.user_name || 'Candidate'} className="flex-1 justify-center text-sm"/>
        </div>

        {/* Availability & preferences */}
        <div className="flex flex-wrap gap-2">
         <AvailabilityBadge availability={selected.availability} />
         {selected.employment_type_preferred && (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20 uppercase tracking-wider">
           <Briefcase className="h-2.5 w-2.5"/> {selected.employment_type_preferred.replace(/_/g, ' ')}
          </span>
         )}
         {selected.is_open_to_work && (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 uppercase tracking-wider">
           <Sparkles className="h-2.5 w-2.5"/> Open to work
          </span>
         )}
        </div>

        {/* Skills */}
        {selected.skills?.length > 0 && (
         <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Skills</h3>
          <div className="space-y-2">
           {selected.skills.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
             <span className="text-sm font-medium text-slate-700">{s.name || s}</span>
             <ProficiencyDots level={s.proficiency} />
            </div>
           ))}
          </div>
         </div>
        )}
       </div>
      </div>
     </div>
    )}
   </div>
  </div>
 )
}
