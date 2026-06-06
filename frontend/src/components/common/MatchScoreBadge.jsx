import { cn } from '@/lib/utils'

export default function MatchScoreBadge({ score, size = 'md' }) {
  const sizes = { sm: 'h-10 w-10 text-xs border-2', md: 'h-14 w-14 text-sm border-2', lg: 'h-20 w-20 text-lg border-4' }
  const rounded = Math.round(score)

  return (
    <div className={cn(
      'relative flex items-center justify-center rounded-full text-ai border-ai/30 bg-ai/5',
      sizes[size]
    )}>
      <span className="font-bold">{rounded}%</span>
    </div>
  )
}
