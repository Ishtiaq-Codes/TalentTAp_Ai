import { useState, useEffect } from 'react'
import { useFetch } from '@/hooks/useFetch'
import { useDebounce } from '@/hooks/useDebounce'
import { candidatesAPI } from '@/api/candidates'
import { jobsAPI } from '@/api/jobs'
import ShortlistButton from '@/components/common/ShortlistButton'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import AvailabilityBadge from '@/components/common/AvailabilityBadge'
import MatchScoreBadge from '@/components/common/MatchScoreBadge'
import CandidateSearchSidebar from './components/CandidateSearchSidebar'
import CandidatePreviewDrawer from './components/CandidatePreviewDrawer'
import {
 Search, MapPin, Award, Sparkles, SlidersHorizontal,
} from 'lucide-react'

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
    <CandidateSearchSidebar 
      showFilters={showFilters}
      setShowFilters={setShowFilters}
      search={search}
      setSearch={setSearch}
      filters={filters}
      setFilters={setFilters}
      clearFilters={clearFilters}
      activeFilterCount={activeFilterCount}
      listLength={list.length}
    />

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
          <ProfileAvatar name={c.user_name} src={c.avatar} size="md" className="h-full w-full" isActive={c.is_open_to_work} />
         </div>

         <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
           <h3 className="text-sm font-semibold text-slate-900 truncate">{c.user_name || 'Candidate'}</h3>
           {c.is_open_to_work && (
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Open to work"/>
           )}
           {c.match_score ? (
            <div className="ml-2 scale-90 origin-left">
             <MatchScoreBadge score={c.match_score} size="sm" />
            </div>
           ) : (c.years_of_experience >= 5 || c.is_recommended) ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-ai/10 px-2 py-0.5 text-[9px] font-bold text-ai uppercase tracking-wider ring-1 ring-inset ring-ai/20 shadow-[0_0_8px_rgba(124,58,237,0.15)] cursor-help" title="Top Match: This candidate has 5+ years of experience or is highly recommended by AI.">
             <Sparkles className="h-2.5 w-2.5"/> Top Match
            </span>
           ) : null}
           {c.verified_expert && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 px-2 py-0.5 text-[9px] font-bold text-amber-800 uppercase tracking-wider ring-1 ring-inset ring-amber-600/30 shadow-sm border border-amber-200" title="Top 1% AI Verified Talent">
             <Award className="h-2.5 w-2.5 text-amber-600"/> Verified
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
    <CandidatePreviewDrawer 
      selected={selected} 
      selectedJobId={selectedJobId} 
      onClose={() => setSelectedId(null)} 
    />
   </div>
  </div>
 )
}
