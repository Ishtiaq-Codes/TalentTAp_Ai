import { useState } from 'react';
import { applicationsAPI } from '@/api/applications';

export default function StatusSelect({ appId, initialStatus, onStatusChange }) {
 const [status, setStatus] = useState(initialStatus);
 const [loading, setLoading] = useState(false);

 const styles = {
  applied: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  reviewing: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  shortlisted: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  interview: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  offered: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  rejected: 'bg-red-50 text-red-700 ring-red-600/20',
  withdrawn: 'bg-slate-50 text-slate-700 ring-slate-600/20',
 };
 
 const style = styles[status] || 'bg-slate-50 text-slate-700 ring-slate-600/20';
 
 const handleChange = async (e) => {
  const newStatus = e.target.value;
  setLoading(true);
  try {
   await applicationsAPI.updateStatus(appId, newStatus);
   setStatus(newStatus);
   if (onStatusChange) onStatusChange();
  } catch (error) {
   console.error('Failed to update status', error);
   setStatus(initialStatus);
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="relative inline-flex items-center">
   <select
    value={status}
    onChange={handleChange}
    disabled={loading}
    className={`appearance-none rounded-md px-3 py-1 pr-8 text-xs font-medium ring-1 ring-inset capitalize cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${style} ${loading ? 'opacity-50' : ''}`}
   >
    <option value="applied">Applied</option>
    <option value="reviewing">Reviewing</option>
    <option value="shortlisted">Shortlisted</option>
    <option value="interview">Interview</option>
    <option value="offered">Offered</option>
    <option value="rejected">Rejected</option>
   </select>
   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
    <svg className={`h-3 w-3 ${styles[status]?.split(' ')[1]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
   </div>
  </div>
 );
}
