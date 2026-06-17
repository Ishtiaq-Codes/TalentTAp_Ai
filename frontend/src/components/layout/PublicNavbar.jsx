import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Logo from '@/components/common/Logo'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/blog', label: 'Blog' },
]

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location])

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4 sm:px-6">
      <div className="w-full max-w-6xl">
        <header
          className={cn(
            'w-full rounded-2xl transition-all duration-300',
            scrolled
              ? 'bg-white/85 backdrop-blur-2xl shadow-[0_4px_24px_rgba(8,12,30,0.08)] border border-white/70 py-1'
              : 'bg-transparent py-2'
          )}
        >
          <div className="flex h-14 items-center justify-between px-5 sm:px-6">
            <Logo />

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'relative rounded-xl px-3.5 py-2 text-sm font-medium transition-colors',
                    location.pathname === to
                      ? 'text-violet-600 bg-violet-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  )}
                >
                  {label}
                  {location.pathname === to && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-violet-500" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden items-center gap-3 md:flex">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary btn-sm"
              >
                Get Started Free
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile drawer */}
          {mobileOpen && (
            <div className="border-t border-slate-200/60 px-4 pb-4 pt-2 md:hidden animate-fade-in">
              <div className="space-y-0.5">
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      'flex rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      location.pathname === to
                        ? 'bg-violet-50 text-violet-700'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-violet-600'
                    )}
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <Link to="/login" className="block btn btn-secondary w-full justify-center">
                  Sign In
                </Link>
                <Link to="/register" className="block btn btn-primary w-full justify-center">
                  Get Started Free
                </Link>
              </div>
            </div>
          )}
        </header>
      </div>
    </div>
  )
}
