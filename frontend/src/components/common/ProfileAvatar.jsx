import { useState } from 'react'
import { cn, getInitials, getImageUrl } from '@/lib/utils'

export default function ProfileAvatar({ name, src, size = 'md', className }) {
  const [error, setError] = useState(false)
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-20 w-20 text-2xl' }

  if (src && !error) {
    return (
      <img
        src={getImageUrl(src)}
        alt={name}
        className={cn('rounded-full object-cover', sizes[size], className)}
        onError={() => setError(true)}
      />
    )
  }

  return (
    <div className={cn(
      'flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary',
      sizes[size], className,
    )}>
      {getInitials(name)}
    </div>
  )
}
