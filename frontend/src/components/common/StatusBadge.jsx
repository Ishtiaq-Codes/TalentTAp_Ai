export default function StatusBadge({ status }) {
 const styles = {
  applied: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  reviewing: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  shortlisted: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  interview: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  offered: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  rejected: 'bg-red-50 text-red-700 ring-red-600/20',
  withdrawn: 'bg-slate-50 text-slate-700 ring-slate-600/20',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  draft: 'bg-slate-50 text-slate-700 ring-slate-600/20',
  closed: 'bg-red-50 text-red-700 ring-red-600/20',
  paused: 'bg-amber-50 text-amber-700 ring-amber-600/20',
 };
 const style = styles[status] || 'bg-slate-50 text-slate-700 ring-slate-600/20';
 return (
  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset capitalize ${style}`}>
   {status}
  </span>
 );
}
