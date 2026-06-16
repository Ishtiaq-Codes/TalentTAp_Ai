import { Sparkles, X } from 'lucide-react'

export default function OutreachModal({ outreachDraft, setOutreachDraft, handleSendOutreach, outreachSending }) {
  if (outreachDraft === null) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
        <div className="mb-5 flex items-center justify-between shrink-0">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Sparkles className="h-5 w-5 text-ai"/> Auto-Drafted Message
          </h2>
          <button onClick={() => setOutreachDraft(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5"/>
          </button>
        </div>
        
        <p className="text-sm text-slate-600 mb-4 shrink-0">
          Review and edit the AI-generated message below. Clicking send will deliver it directly to the candidate's inbox.
        </p>

        <div className="flex-1 min-h-0 relative rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
          <textarea
            value={outreachDraft}
            onChange={e => setOutreachDraft(e.target.value)}
            className="w-full h-full min-h-[300px] resize-none bg-transparent p-4 text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ai/50"
          />
        </div>
        
        <div className="mt-6 flex justify-end gap-3 shrink-0">
          <button onClick={() => setOutreachDraft(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSendOutreach} 
            disabled={outreachSending || !outreachDraft.trim()} 
            className="rounded-lg bg-ai px-6 py-2 text-sm font-semibold text-white hover:bg-ai/90 shadow-sm transition-all disabled:opacity-50"
          >
            {outreachSending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>
    </div>
  )
}
