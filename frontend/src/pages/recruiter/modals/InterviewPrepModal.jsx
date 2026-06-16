import { Sparkles, X } from 'lucide-react'

export default function InterviewPrepModal({ interviewDraft, setInterviewDraft }) {
  if (interviewDraft === null) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 my-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Sparkles className="h-5 w-5 text-ai"/> Tailored Interview Guide
          </h2>
          <button onClick={() => setInterviewDraft(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5"/>
          </button>
        </div>
        
        <p className="text-sm text-slate-600 mb-6">
          These questions were dynamically generated based on the semantic gap between this candidate's profile and your job requirements.
        </p>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 whitespace-pre-wrap font-mono leading-relaxed">
            {interviewDraft}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button onClick={() => setInterviewDraft(null)} className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 shadow-sm transition-all">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
