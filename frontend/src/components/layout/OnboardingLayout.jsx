import { Outlet } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import Logo from '@/components/common/Logo'

export default function OnboardingLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
        <Logo />
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          Secure Setup
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-start px-4 py-12 sm:px-6">
        <div className="w-full max-w-3xl">
          <Outlet />
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} TalentTap AI. All rights reserved.
      </footer>
    </div>
  )
}
