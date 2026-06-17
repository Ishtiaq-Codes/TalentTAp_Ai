export default function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`card-premium p-5 animate-pulse ${className}`}>
      {/* Header row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-9 w-9 rounded-xl bg-slate-100 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-slate-100 rounded-full w-2/3" />
          <div className="h-2.5 bg-slate-100 rounded-full w-1/2" />
        </div>
      </div>
      {/* Content lines */}
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-2.5 bg-slate-100 rounded-full"
            style={{ width: i === lines - 1 ? '60%' : '100%' }}
          />
        ))}
      </div>
    </div>
  )
}

export function SkeletonRow({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 py-3 animate-pulse ${className}`}>
      <div className="h-9 w-9 rounded-xl bg-slate-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-slate-100 rounded-full w-1/2" />
        <div className="h-2.5 bg-slate-100 rounded-full w-1/3" />
      </div>
      <div className="h-7 w-20 bg-slate-100 rounded-full flex-shrink-0" />
    </div>
  )
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-slate-100 rounded-full"
          style={{ width: i === lines - 1 ? '50%' : '100%' }}
        />
      ))}
    </div>
  )
}
