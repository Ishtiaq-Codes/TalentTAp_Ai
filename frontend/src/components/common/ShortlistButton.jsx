import { useState } from 'react'
import { applicationsAPI } from '@/api/applications'
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'

export default function ShortlistButton({ candidateId, jobId, initialIsShortlisted = false, className = '' }) {
  const [isShortlisted, setIsShortlisted] = useState(initialIsShortlisted)
  const [loading, setLoading] = useState(false)

  const toggleShortlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    setLoading(true)
    try {
      const payload = { candidate: candidateId }
      if (jobId) payload.job = jobId

      const response = await applicationsAPI.toggleShortlist(payload)
      setIsShortlisted(response.is_shortlisted)
    } catch (err) {
      console.error('Shortlist error:', err)
      alert(err.response?.data?.detail || 'Error toggling shortlist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggleShortlist}
      disabled={loading}
      className={`group relative inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${isShortlisted
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
          : 'border border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary hover:shadow-sm'
        } ${className}`}
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
