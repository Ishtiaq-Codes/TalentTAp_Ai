import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Logo from '@/components/common/Logo'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
]

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 sm:px-6 transition-all duration-500">
      <header
        className={`w-full max-w-7xl transition-all duration-500 rounded-2xl ${
          scrolled
            ? 'bg-white/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/50 py-1'
            : 'bg-transparent py-2'
        }`}
      >
        <div className="mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`group relative text-sm font-medium transition-colors ${
                location.pathname === to
                  ? 'text-primary'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {label}
              {/* Animated Underline */}
              <span className={`absolute -bottom-1.5 left-0 h-0.5 bg-primary transition-all duration-300 ${
                location.pathname === to ? 'w-full' : 'w-0 group-hover:w-full'
              }`} />
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Sign In
          </Link>
          <div className="relative group">
            {/* Soft glow behind the button */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500 animate-pulse-soft"></div>
            <Link
              to="/register"
              className="relative flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800"
            >
              Get Started Free
            </Link>
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-200/50 bg-white/95 backdrop-blur-xl md:hidden animate-fade-in mt-2 mx-4 rounded-xl shadow-lg">
          <div className="space-y-1 px-4 py-4">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary"
              >
                {label}
              </Link>
            ))}
            <hr className="my-3 border-slate-100" />
            <Link
              to="/login"
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="mt-2 block rounded-full bg-slate-900 px-3 py-3 text-center text-sm font-semibold text-white shadow-md"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
      </header>
    </div>
  )
}
