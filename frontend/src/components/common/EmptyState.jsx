import { cn } from '@/lib/utils'

export default function EmptyState({
  icon: Icon,
  title = 'Nothing here yet',
  description,
  action,
  className,
}) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-16 px-8 text-center',
      className
    )}>
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-400 mb-1">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <div>
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        {description && (
          <p className="mt-1.5 text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">{description}</p>
        )}
      </div>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  )
}
