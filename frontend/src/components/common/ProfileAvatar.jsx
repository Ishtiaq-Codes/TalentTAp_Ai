import { cn } from '@/lib/utils'

const SIZE_MAP = {
  xs:  { container: 'h-6 w-6',   text: 'text-[9px]' },
  sm:  { container: 'h-8 w-8',   text: 'text-xs' },
  md:  { container: 'h-9 w-9',   text: 'text-sm' },
  lg:  { container: 'h-12 w-12', text: 'text-base' },
  xl:  { container: 'h-16 w-16', text: 'text-xl' },
  '2xl':{ container: 'h-20 w-20', text: 'text-2xl' },
}

// Generate a consistent gradient from a name string
function getGradient(name = '') {
  const palettes = [
    'from-violet-500 to-purple-700',
    'from-indigo-500 to-blue-700',
    'from-rose-500 to-pink-700',
    'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-700',
    'from-cyan-500 to-blue-600',
    'from-fuchsia-500 to-violet-700',
    'from-lime-500 to-green-600',
  ]
  const charSum = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return palettes[charSum % palettes.length]
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('')
}

export default function ProfileAvatar({
  name = '',
  src,
  size = 'md',
  className,
  online,
  showRing = false,
}) {
  const { container, text } = SIZE_MAP[size] || SIZE_MAP.md
  const initials = getInitials(name)
  const gradient = getGradient(name)

  return (
    <div className={cn('relative flex-shrink-0', className)}>
      <div
        className={cn(
          container,
          'rounded-full overflow-hidden flex items-center justify-center font-bold text-white select-none flex-shrink-0',
          showRing && 'ring-2 ring-violet-500 ring-offset-1',
          !src && `bg-gradient-to-br ${gradient}`
        )}
      >
        {src ? (
          <img src={src} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className={cn(text, 'font-semibold leading-none')}>{initials || '?'}</span>
        )}
      </div>

      {/* Online indicator */}
      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-white',
            online ? 'bg-emerald-500' : 'bg-slate-400'
          )}
        />
      )}
    </div>
  )
}
