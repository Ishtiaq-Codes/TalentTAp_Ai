import { cn } from '@/lib/utils'

export default function StatCard({ icon: Icon, label, value, trend, className }) {
  return (
    <div className={cn('rounded-xl border bg-card p-6 transition-shadow hover:shadow-md', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {trend && (
        <p className={cn('mt-1 text-xs', trend > 0 ? 'text-emerald-600' : 'text-red-500')}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)} this month
        </p>
      )}
    </div>
  )
}
