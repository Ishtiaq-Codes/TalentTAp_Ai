import { Activity } from 'lucide-react';

export default function DashboardStat({ icon: Icon, label, value, trend, trendLabel }) {
 return (
  <div className="glass-card rounded-2xl p-6 transition-all hover:shadow-md">
   <div className="flex items-center justify-between">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
     <Icon className="h-6 w-6"/>
    </div>
    {trend && (
     <span className={`flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${trend.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
      <Activity className="h-3 w-3 mr-1"/> {trend}
     </span>
    )}
   </div>
   <div className="mt-4">
    <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
    <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{value}</p>
    {trendLabel && <p className="mt-1 text-xs text-muted-foreground">{trendLabel}</p>}
   </div>
  </div>
 );
}
