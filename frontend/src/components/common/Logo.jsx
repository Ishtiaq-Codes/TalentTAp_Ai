import { Briefcase, Sparkles } from 'lucide-react'

export default function Logo({ collapsed = false }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Sparkles className="h-5 w-5" />
      </div>
      {!collapsed && (
        <span className="text-lg font-bold tracking-tight">
          Talent<span className="text-primary">Tap</span> AI
        </span>
      )}
    </div>
  )
}
