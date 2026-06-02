import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Logo({ collapsed = false, linkTo = '/' }) {
  const content = (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-700 text-white shadow-md shadow-primary/25">
        <Sparkles className="h-4.5 w-4.5" />
      </div>
      {!collapsed && (
        <span className="text-lg font-bold tracking-tight text-foreground">
          Talent<span className="text-primary">Tap</span>
          <span className="ml-0.5 text-xs font-medium text-muted-foreground">AI</span>
        </span>
      )}
    </div>
  )

  return linkTo ? <Link to={linkTo}>{content}</Link> : content
}
