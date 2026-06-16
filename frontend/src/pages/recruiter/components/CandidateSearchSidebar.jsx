import React from 'react';
import { Search, MapPin, Globe, Filter, X } from 'lucide-react';

export default function CandidateSearchSidebar({ 
  showFilters, 
  setShowFilters, 
  search, 
  setSearch, 
  filters, 
  setFilters, 
  clearFilters, 
  activeFilterCount, 
  listLength 
}) {
  return (
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
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { value: '', label: 'Any' },
                { value: 'immediate', label: 'Immediate' },
                { value: '2_weeks', label: 'In 2 Weeks' },
                { value: '1_month', label: 'In 1 Month' },
                { value: '3_months', label: 'In 3 Months' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilters({ ...filters, availability: opt.value || undefined })}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    (filters.availability || '') === opt.value
                      ? 'bg-primary text-white shadow-md ring-2 ring-primary ring-offset-1'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            <div className="mt-3 flex flex-wrap gap-2">
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
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    (filters.employment_type_preferred || '') === opt.value
                      ? 'bg-primary text-white shadow-md ring-2 ring-primary ring-offset-1'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            <div className="mt-3 flex flex-wrap gap-2">
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
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    (filters.employment_status || '') === opt.value
                      ? 'bg-primary text-white shadow-md ring-2 ring-primary ring-offset-1'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
              Show {listLength} Results
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
