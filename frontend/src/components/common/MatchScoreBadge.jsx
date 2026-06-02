import { cn, getMatchColor } from '@/lib/utils'

export default function MatchScoreBadge({ score, size = 'md' }) {
  const sizes = { sm: 'h-10 w-10 text-xs', md: 'h-14 w-14 text-sm', lg: 'h-20 w-20 text-lg' }
  const rounded = Math.round(score)

  return (
    <div className={cn(
      'relative flex items-center justify-center rounded-full border-2',
      sizes[size], getMatchColor(score),
    )} style={{ borderColor: 'currentColor' }}>
      <span className="font-bold">{rounded}%</span>
    </div>
  )
}
