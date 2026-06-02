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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-border/50'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                location.pathname === to
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-md shadow-primary/25 hover:bg-primary/90 transition-all hover:shadow-lg"
          >
            Get Started Free
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-foreground hover:bg-muted md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-white/95 backdrop-blur-xl md:hidden animate-fade-in">
          <div className="space-y-1 px-4 py-4">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                {label}
              </Link>
            ))}
            <hr className="my-3" />
            <Link
              to="/login"
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="block rounded-full bg-primary px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
