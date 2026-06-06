import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useFetch } from '@/hooks/useFetch'
import { jobsAPI } from '@/api/jobs'
import { applicationsAPI } from '@/api/applications'
import ProfileAvatar from '@/components/common/ProfileAvatar'
import SkeletonCard from '@/components/common/SkeletonCard'
import { ArrowLeft, MapPin, Briefcase, Clock, DollarSign, Building, Sparkles, X } from 'lucide-react'
import { candidatesAPI } from '@/api/candidates'

export default function CandidateJobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: job, loading } = useFetch(() => jobsAPI.get(id), [id])
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)

  const handleApply = async () => {
    setApplying(true)
    try {
      await applicationsAPI.apply({ job: id })
      setApplied(true)
    } catch { }
    setApplying(false)
  }

  const [coverLetterDraft, setCoverLetterDraft] = useState(null)
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false)

  const handleGenerateCoverLetter = async () => {
    setGeneratingCoverLetter(true)
    setCoverLetterDraft('')
    try {
      await candidatesAPI.generateCoverLetterStream(id, (chunk) => {
        setCoverLetterDraft(prev => (prev || '') + chunk)
      })
    } catch (e) {
      console.error(e)
    }
    setGeneratingCoverLetter(false)
  }

  if (loading) return <div className="max-w-4xl mx-auto space-y-6"><SkeletonCard /><SkeletonCard /></div>
  if (!job) return <div className="text-center py-20 text-slate-500">Job not found.</div>

  const isApplied = applied || job.has_applied

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Jobs
      </button>

      {/* Header */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <Link to={`/companies/${job.company}`} className="shrink-0 group">
                <ProfileAvatar src={job.company_logo} name={job.company_name} size="xl" className="rounded-2xl border-2 border-slate-100 shadow-md group-hover:border-primary/50 transition-colors" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{job.title}</h1>
                <Link to={`/companies/${job.company}`} className="mt-2 inline-flex items-center gap-2 text-lg font-medium text-primary hover:text-primary/80 transition-colors">
                  <Building className="h-5 w-5" />
                  {job.company_name}
                </Link>
                <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-slate-600">
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-slate-400" /> {job.city || job.country || 'Location not specified'}</span>
                  <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-slate-400" /> {job.employment_type?.replace('_', ' ')}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-slate-400" /> {job.is_remote}</span>
                  {job.salary_min && (
                    <span className="flex items-center gap-1.5"><DollarSign className="h-4 w-4 text-slate-400" /> {job.salary_min} - {job.salary_max} {job.salary_currency}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-stretch sm:items-end gap-3">
              <button
                onClick={handleGenerateCoverLetter}
                disabled={generatingCoverLetter}
                className="w-full sm:w-auto rounded-xl bg-ai/10 px-6 py-3 text-sm font-bold text-ai shadow-sm hover:bg-ai/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" /> {generatingCoverLetter ? 'Generating...' : 'Auto-Draft Cover Letter'}
              </button>
              <button
                onClick={handleApply}
                disabled={applying || isApplied}
                className="w-full sm:w-auto rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                {isApplied ? '✓ Application Submitted' : applying ? 'Applying...' : 'Apply Now'}
              </button>
              <p className="text-xs text-slate-400 text-center sm:text-right font-medium">Posted {new Date(job.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-4 mb-6">About the Role</h2>
            <div className="prose prose-slate max-w-none text-slate-600">
              <p className="whitespace-pre-wrap leading-relaxed">{job.description}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-4">Required Skills</h2>
            {job.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {job.skills.map(s => (
                  <span key={s.id} className={`rounded-lg px-3 py-1.5 text-sm font-medium border ${s.is_required ? 'bg-primary/5 text-primary border-primary/20' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    {s.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No specific skills listed.</p>
            )}
          </div>
        </div>
      </div>

      {/* AI Cover Letter Modal */}
      {coverLetterDraft !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 my-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <Sparkles className="h-5 w-5 text-ai" /> Tailored Cover Letter
              </h2>
              <button onClick={() => setCoverLetterDraft(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-sm text-slate-600 mb-6">
              Review and copy this AI-generated cover letter tailored specifically to your profile and this job description.
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 whitespace-pre-wrap font-mono leading-relaxed">
                {coverLetterDraft}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => navigator.clipboard.writeText(coverLetterDraft)} className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
                Copy to Clipboard
              </button>
              <button onClick={() => setCoverLetterDraft(null)} className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 shadow-sm transition-all">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
