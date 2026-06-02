import { useFetch } from '@/hooks/useFetch'
import { authAPI } from '@/api/auth'
import StatCard from '@/components/common/StatCard'
import SkeletonCard from '@/components/common/SkeletonCard'
import { Users, Building2, Briefcase, BarChart3 } from 'lucide-react'

// Placeholder for real admin APIs
export default function AdminDashboardPage() {
  const { data: user, loading } = useFetch(() => authAPI.getMe())

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Analytics Dashboard</h1>
        <p className="text-muted-foreground">Platform-wide overview and statistics.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Candidates" value="6" />
        <StatCard icon={Building2} label="Total Companies" value="3" />
        <StatCard icon={Briefcase} label="Active Jobs" value="4" />
        <StatCard icon={BarChart3} label="Match Accuracy" value="85%" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <p>New user registered</p>
                <span className="text-muted-foreground ml-auto">2h ago</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Matching Engine</span>
              <span className="text-emerald-500 font-medium">Online</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Database</span>
              <span className="text-emerald-500 font-medium">Online</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Email Service</span>
              <span className="text-emerald-500 font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
