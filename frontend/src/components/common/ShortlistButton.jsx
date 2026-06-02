import { useState } from 'react'
import { applicationsAPI } from '@/api/applications'
import { Bookmark, BookmarkCheck } from 'lucide-react'

export default function ShortlistButton({ candidateId, jobId, initialIsShortlisted = false }) {
  const [isShortlisted, setIsShortlisted] = useState(initialIsShortlisted)
  const [loading, setLoading] = useState(false)

  const toggleShortlist = async () => {
    setLoading(true)
    try {
      if (isShortlisted) {
        // Here we'd need the shortlist ID to delete
        setIsShortlisted(false)
      } else {
        const payload = { candidate: candidateId, notes: '' }
        if (jobId) payload.job = jobId
        
        await applicationsAPI.addToShortlist(payload)
        setIsShortlisted(true)
        alert('Candidate successfully shortlisted!')
      }
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.detail || err.response?.data?.candidate?.[0] || 'Error shortlisting candidate')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggleShortlist}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
        isShortlisted 
          ? 'bg-primary/10 text-primary hover:bg-primary/20' 
          : 'border text-muted-foreground hover:bg-muted'
      }`}
    >
      {isShortlisted ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
      {isShortlisted ? 'Shortlisted' : 'Shortlist'}
    </button>
  )
}
