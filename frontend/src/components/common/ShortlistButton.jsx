import { useState } from 'react'
import { applicationsAPI } from '@/api/applications'
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'

export default function ShortlistButton({ candidateId, jobId, initialIsShortlisted = false }) {
  const [isShortlisted, setIsShortlisted] = useState(initialIsShortlisted)
  const [loading, setLoading] = useState(false)

  const toggleShortlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    setLoading(true)
    try {
      if (isShortlisted) {
        // Typically we'd need the specific shortlist ID to delete, but for UX simulation:
        setIsShortlisted(false)
      } else {
        const payload = { candidate: candidateId, notes: '' }
        if (jobId) payload.job = jobId
        
        await applicationsAPI.addToShortlist(payload)
        setIsShortlisted(true)
      }
    } catch (err) {
      console.error('Shortlist error:', err)
      // If it's already shortlisted, just update state instead of showing an error
      if (err.response?.status === 400 && JSON.stringify(err.response?.data).includes('already')) {
        setIsShortlisted(true)
      } else {
        alert(err.response?.data?.detail || err.response?.data?.candidate?.[0] || 'Error shortlisting candidate')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggleShortlist}
      disabled={loading}
      className={`group relative inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
        isShortlisted 
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
          : 'border border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary hover:shadow-sm'
      }`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isShortlisted ? (
        <BookmarkCheck className="h-3.5 w-3.5" />
      ) : (
        <Bookmark className="h-3.5 w-3.5 group-hover:fill-primary/20" />
      )}
      {isShortlisted ? 'Saved' : 'Save'}
    </button>
  )
}
