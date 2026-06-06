import { useState } from 'react'
import { cn, getInitials, getImageUrl } from '@/lib/utils'

export default function ProfileAvatar({ name, src, size = 'md', className, isActive = false }) {
  const [error, setError] = useState(false)
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-20 w-20 text-2xl' }
  const dotSizes = { sm: 'h-2 w-2', md: 'h-2.5 w-2.5', lg: 'h-3.5 w-3.5', xl: 'h-4 w-4' }

  const AvatarContent = () => {
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

  if (isActive) {
    return (
      <div className="relative inline-block">
        <AvatarContent />
        <span className={cn('absolute bottom-0 right-0 rounded-full border-2 border-white bg-emerald-500', dotSizes[size])} />
      </div>
    )
  }

  return <AvatarContent />
}
