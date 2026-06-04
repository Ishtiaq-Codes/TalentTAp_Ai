import { useState, useEffect } from 'react'
import { X, Loader2, Sparkles, Plus, AlertCircle } from 'lucide-react'
import { createPortal } from 'react-dom'
import { companiesAPI } from '@/api/companies'
import { useToast } from '@/contexts/ToastContext'

export default function AddToPoolModal({ isOpen, onClose, candidateId, candidateName, onSuccess }) {
  const [pools, setPools] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedPoolId, setSelectedPoolId] = useState('')
  const [notes, setNotes] = useState('')
  const { success, error: showError } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchPools()
    }
  }, [isOpen])

  const fetchPools = async () => {
    setLoading(true)
    try {
      const res = await companiesAPI.getPools()
      setPools(res.data)
      if (res.data.length > 0) {
        setSelectedPoolId(res.data[0].id)
      }
    } catch (err) {
      showError('Failed to load talent pools')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPoolId) return

    setSubmitting(true)
    try {
      await companiesAPI.addPoolMember(selectedPoolId, candidateId, notes)
      success(`${candidateName} added to talent pool!`)
      onClose()
      if (onSuccess) onSuccess()
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to add candidate to pool. They may already be in it.'
      showError(msg)
      onClose()
    } finally {
      // only set submitting false if not closing, but we always close now
      // so we can omit it or check mounted state.
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div 
          className="w-full max-w-md scale-100 transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all animate-in zoom-in-95"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" /> Add to Talent Pool
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <p className="text-sm text-slate-500 mb-6">
              Add <span className="font-semibold text-slate-800">{candidateName}</span> to a talent pool for future consideration.
            </p>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : pools.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">No Talent Pools Found</p>
                  <p className="text-xs text-amber-700 mt-1">Your company has not created any talent pools yet. You can create them from the Talent Pools page.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Pool</label>
                  <select
                    required
                    value={selectedPoolId}
                    onChange={(e) => setSelectedPoolId(e.target.value)}
                    className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary text-sm"
                  >
                    {pools.map(pool => (
                      <option key={pool.id} value={pool.id}>
                        {pool.name} ({pool.member_count} members)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Internal Notes (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Why are you adding them to this pool?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary text-sm resize-none"
                  />
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || pools.length === 0}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add to Pool
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  )
}
