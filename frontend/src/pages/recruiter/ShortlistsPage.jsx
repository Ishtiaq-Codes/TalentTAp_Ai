import { useFetch } from '@/hooks/useFetch'
import { applicationsAPI } from '@/api/applications'
import SkeletonCard from '@/components/common/SkeletonCard'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import MessageButton from '@/components/common/MessageButton'
import { Bookmark, Trash2, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ShortlistsPage() {
  const { data: shortlists, loading, refetch } = useFetch(() => applicationsAPI.getShortlists())

  const removeShortlist = async (id) => {
    if (confirm('Remove this candidate from shortlists?')) {
      await applicationsAPI.removeFromShortlist(id)
      refetch()
    }
  }

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
  
  const list = Array.isArray(shortlists) ? shortlists : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Candidate Shortlists</h1>
          <p className="text-muted-foreground">Candidates you've saved for future reference or specific jobs.</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Bookmark className="h-6 w-6 text-primary" />
        </div>
      </div>

      <div className="space-y-4">
        {list.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
            You haven't shortlisted any candidates yet. 
            Browse your job matches to start saving top candidates.
          </div>
        ) : (
          list.map(item => (
            <div key={item.id} className="flex items-center gap-4 rounded-xl border bg-card p-5 hover:shadow-sm">
              <ProfileAvatar name={item.candidate_name} size="md" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.candidate_name}</h3>
                <p className="text-sm text-muted-foreground">{item.candidate_headline}</p>
                {item.job_title && (
                  <p className="mt-1 text-xs font-medium text-primary bg-primary/10 inline-block px-2 py-0.5 rounded-full">
                    Saved for: {item.job_title}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <MessageButton recipientId={item.candidate_user_id} name={item.candidate_name} />
                <button 
                  onClick={() => removeShortlist(item.id)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Remove from shortlist"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
