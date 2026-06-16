/**
 * Shared Profile Strength indicator used on both:
 * - Candidate's own ProfilePage (with suggestions)
 * - Recruiter's CandidateDetailPage (compact view)
 */

const TIERS = [
  { min: 0, label: 'Starter Profile', color: 'text-red-700', bg: 'from-red-50 to-orange-50', border: 'border-red-200', ring: 'ring-red-500/20', bar: 'bg-red-500', icon: '🚀' },
  { min: 31, label: 'Growing Profile', color: 'text-amber-700', bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200', ring: 'ring-amber-500/20', bar: 'bg-amber-500', icon: '📈' },
  { min: 61, label: 'Strong Profile', color: 'text-blue-700', bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200', ring: 'ring-blue-500/20', bar: 'bg-blue-500', icon: '💪' },
  { min: 81, label: 'Outstanding Profile', color: 'text-emerald-700', bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-200', ring: 'ring-emerald-500/20', bar: 'bg-emerald-500', icon: '⭐' },
]

function getTier(completion) {
  return [...TIERS].reverse().find(t => completion >= t.min) || TIERS[0]
}

/**
 * Full banner with suggestions - used on candidate's own profile page.
 */
export function ProfileStrengthBanner({ completion, suggestions = [] }) {
  const tier = getTier(completion)
  return (
    <div className={`rounded-xl border ${tier.border} bg-gradient-to-r ${tier.bg} p-5`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{tier.icon}</span>
          <span className={`text-sm font-bold ${tier.color}`}>{tier.label}</span>
        </div>
        <span className={`text-2xl font-bold ${tier.color}`}>{completion}%</span>
      </div>
      <div className="h-2 bg-white/60 rounded-full overflow-hidden mb-3">
        <div className={`h-full rounded-full transition-all duration-1000 ${tier.bar}`} style={{ width: `${completion}%` }} />
      </div>
      {suggestions.length > 0 && (
        <div className="space-y-1.5">
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
              <span className="h-3 w-3 text-amber-500 shrink-0">⚠</span>
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Compact badge - used on recruiter's candidate detail sidebar.
 */
export function ProfileStrengthCompact({ completion }) {
  const tier = getTier(completion)
  return (
    <div className={`rounded-xl p-4 bg-gradient-to-r ${tier.bg} ring-1 ring-inset ${tier.ring}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-bold uppercase tracking-wider ${tier.color}`}>{tier.label}</span>
        <span className={`text-lg font-bold ${tier.color}`}>{completion}%</span>
      </div>
      <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${tier.bar}`} style={{ width: `${completion}%` }} />
      </div>
    </div>
  )
}
