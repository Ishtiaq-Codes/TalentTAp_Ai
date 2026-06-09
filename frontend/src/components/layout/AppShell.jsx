import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import MobileNav from './MobileNav'
import CopilotChatbot from '@/components/shared/CopilotChatbot'
import { useAuth } from '@/contexts/AuthContext'

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans selection:bg-primary/20">
      <Sidebar />
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Animated Mesh Background for all Dashboards */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-slate-50/50">
          <div className="absolute -top-[20%] -right-[10%] h-[70vw] w-[70vw] max-w-[800px] animate-pulse-soft rounded-full bg-gradient-to-br from-primary/15 to-ai/15 blur-[100px]" />
          <div className="absolute -bottom-[20%] -left-[10%] h-[70vw] w-[70vw] max-w-[800px] animate-pulse-soft rounded-full bg-gradient-to-tr from-blue-500/15 to-primary/15 blur-[100px]" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
          <Topbar onToggleMobile={() => setMobileOpen(true)} />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">
            <div className="mx-auto max-w-7xl h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {user && <CopilotChatbot user={user} />}
    </div>
  )
}
