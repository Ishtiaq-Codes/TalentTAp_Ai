import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,          // number: positive = up, negative = down, 0 = flat
  trendLabel,
  color = 'violet', // 'violet' | 'amber' | 'emerald' | 'rose' | 'blue' | 'slate'
  className,
}) {
  const colorMap = {
    violet: { icon: 'bg-violet-100 text-violet-600', glow: 'shadow-violet-100' },
    amber:  { icon: 'bg-amber-100 text-amber-600',   glow: 'shadow-amber-100' },
    emerald:{ icon: 'bg-emerald-100 text-emerald-600', glow: 'shadow-emerald-100' },
    rose:   { icon: 'bg-rose-100 text-rose-600',     glow: 'shadow-rose-100' },
    blue:   { icon: 'bg-blue-100 text-blue-600',     glow: 'shadow-blue-100' },
    slate:  { icon: 'bg-slate-100 text-slate-600',   glow: 'shadow-slate-100' },
  }
  const colors = colorMap[color] || colorMap.violet

  const trendIcon = trend > 0
    ? <TrendingUp className="h-3.5 w-3.5" />
    : trend < 0
    ? <TrendingDown className="h-3.5 w-3.5" />
    : <Minus className="h-3.5 w-3.5" />

  const trendColor = trend > 0
    ? 'text-emerald-600 bg-emerald-50'
    : trend < 0
    ? 'text-red-500 bg-red-50'
    : 'text-slate-500 bg-slate-100'

  return (
    <div className={cn(
      'card-premium p-5 flex flex-col gap-4',
      className
    )}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', colors.icon)}>
            <Icon className="h-4.5 w-4.5" style={{ height: '18px', width: '18px' }} />
          </div>
        )}
      </div>

      <div>
        <p className="text-3xl font-bold text-slate-900 leading-none">{value ?? '—'}</p>
        {(trend !== undefined && trendLabel) && (
          <div className={cn(
            'mt-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
            trendColor
          )}>
            {trendIcon}
            {Math.abs(trend)}% {trendLabel}
          </div>
        )}
      </div>
    </div>
  )
}
