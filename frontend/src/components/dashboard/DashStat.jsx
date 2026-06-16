import { Activity } from 'lucide-react';

export default function DashStat({ icon: Icon, label, value, color = 'blue', sub }) {
 const colors = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  violet: 'bg-violet-50 text-violet-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  slate: 'bg-slate-100 text-slate-500',
 };

 return (
  <div className="glass-card rounded-2xl p-5">
   <div className="flex items-start justify-between">
    <div>
     <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
     <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value ?? '-'}</p>
     {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}>
     <Icon className="h-5 w-5"/>
    </div>
   </div>
  </div>
 );
}
