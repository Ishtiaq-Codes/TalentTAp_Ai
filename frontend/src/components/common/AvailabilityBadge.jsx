import React from 'react';
import { Clock } from 'lucide-react';

export default function AvailabilityBadge({ availability }) {
 if (!availability) return null;
 const colors = {
  immediate: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  '2_weeks': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  '1_month': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  '3_months': 'bg-orange-50 text-orange-700 ring-orange-600/20',
  not_available: 'bg-red-50 text-red-700 ring-red-600/20',
 };
 return (
  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset uppercase tracking-wider ${colors[availability] || 'bg-slate-50 text-slate-600 ring-slate-600/20'}`}>
   <Clock className="h-2.5 w-2.5"/>
   {availability?.replace(/_/g, ' ')}
  </span>
 );
}
