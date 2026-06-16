import { Link } from 'react-router-dom';
import { Eye, Star, XCircle, Bookmark, RefreshCw, Briefcase, Trash2, Users, Activity, Clock, Award } from 'lucide-react';
import ProfileAvatar from '../common/ProfileAvatar';
import { formatDateTime } from '@/lib/utils';

export default function RecruiterActivityCard({ recruiter }) {
 const activities = recruiter.recent_activities || [];
 const rName = recruiter.name.split(' ')[0];

 return (
  <div className="glass-card rounded-xl overflow-hidden flex flex-col h-[400px]">
   <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-3">
    <ProfileAvatar name={recruiter.name} src={recruiter.avatar} size="sm"/>
    <div>
     <h3 className="font-semibold text-slate-900 text-sm leading-tight">{recruiter.name}</h3>
     <p className="text-xs text-slate-500">Recent Activity</p>
    </div>
   </div>
   <div className="p-2 overflow-y-auto overflow-x-hidden flex-1">
    {activities.length === 0 ? (
     <div className="py-8 text-center px-4">
      <Activity className="h-8 w-8 text-slate-300 mx-auto mb-3"/>
      <p className="text-sm text-slate-500">No recent actions.</p>
     </div>
    ) : (
     <div className="space-y-1">
      {activities.map((activity) => {
       let Icon = Eye;
       let iconClass = "bg-blue-100 text-blue-600";
       let titleText = "";
       let subtitleText = "";
       let linkTo = "#";

       if (activity.action_type === 'view') {
        titleText = <span><span className="font-medium">{rName}</span> viewed {activity.candidate_name}'s profile</span>;
        subtitleText = activity.job_title ? `For ${activity.job_title}` : activity.candidate_headline;
        linkTo = `/recruiter/candidates/${activity.candidate_id}${activity.job_title ? '?job_id=' : ''}`;
       } else if (activity.action_type === 'shortlist') {
        Icon = Star;
        iconClass = "bg-purple-100 text-purple-600";
        titleText = <span><span className="font-medium">{rName}</span> shortlisted {activity.candidate_name}</span>;
        subtitleText = activity.job_title ? `For ${activity.job_title}` : activity.candidate_headline;
        linkTo = `/recruiter/candidates/${activity.candidate_id}${activity.job_title ? '?job_id=' : ''}`;
       } else if (activity.action_type === 'reject') {
        Icon = XCircle;
        iconClass = "bg-red-100 text-red-600";
        titleText = <span><span className="font-medium">{rName}</span> rejected {activity.candidate_name}</span>;
        subtitleText = activity.job_title ? `For ${activity.job_title}` : activity.candidate_headline;
        linkTo = `/recruiter/candidates/${activity.candidate_id}${activity.job_title ? '?job_id=' : ''}`;
       } else if (activity.action_type === 'save') {
        Icon = Bookmark;
        iconClass = "bg-emerald-100 text-emerald-600";
        titleText = <span><span className="font-medium">{rName}</span> saved {activity.candidate_name}</span>;
        subtitleText = activity.job_title ? `For ${activity.job_title}` : activity.candidate_headline;
        linkTo = `/recruiter/candidates/${activity.candidate_id}${activity.job_title ? '?job_id=' : ''}`;
       } else if (activity.action_type === 'status_change') {
        let detailsObj = {};
        try { detailsObj = typeof activity.details === 'string' ? JSON.parse(activity.details) : (activity.details || {}); } catch(e) {}
        const status = (detailsObj.status || "a new stage").toLowerCase();
        
        if (status === 'rejected') {
         Icon = XCircle;
         iconClass = "bg-red-100 text-red-600";
         titleText = <span><span className="font-medium">{rName}</span> rejected {activity.candidate_name}</span>;
        } else if (status === 'offered') {
         Icon = Award;
         iconClass = "bg-emerald-100 text-emerald-600";
         titleText = <span><span className="font-medium">{rName}</span> offered a job to {activity.candidate_name}</span>;
        } else if (status === 'interview') {
         Icon = Clock;
         iconClass = "bg-indigo-100 text-indigo-600";
         titleText = <span><span className="font-medium">{rName}</span> scheduled an interview with {activity.candidate_name}</span>;
        } else if (status === 'shortlisted') {
         Icon = Star;
         iconClass = "bg-purple-100 text-purple-600";
         titleText = <span><span className="font-medium">{rName}</span> shortlisted {activity.candidate_name}</span>;
        } else {
         Icon = RefreshCw;
         iconClass = "bg-indigo-100 text-indigo-600";
         titleText = <span>{rName} moved {activity.candidate_name} to <span className="font-medium capitalize">{status}</span></span>;
        }
        subtitleText = activity.job_title ? `For ${activity.job_title}` : activity.candidate_headline;
        linkTo = `/recruiter/candidates/${activity.candidate_id}${activity.job_title ? '?job_id=' : ''}`;
       } else if (activity.action_type === 'job_create') {
        Icon = Briefcase;
        iconClass = "bg-blue-100 text-blue-600";
        titleText = <span><span className="font-medium">{rName}</span> posted a new job</span>;
        subtitleText = activity.details?.title || "Job Posting";
        linkTo = `/recruiter/jobs/${activity.job_title ? activity.job_id : ''}`;
       } else if (activity.action_type === 'job_delete') {
        Icon = Trash2;
        iconClass = "bg-slate-100 text-slate-600";
        titleText = <span><span className="font-medium">{rName}</span> deleted a job post</span>;
        subtitleText = activity.details?.title || "Job Posting";
        linkTo = `/recruiter/jobs`;
       } else if (activity.action_type === 'talent_pool') {
        Icon = Users;
        iconClass = "bg-amber-100 text-amber-600";
        const poolName = activity.details?.pool_name || "a talent pool";
        titleText = <span>{rName} added {activity.candidate_name} to <span className="font-medium">{poolName}</span></span>;
        subtitleText = "Talent Pool Activity";
        linkTo = `/company/talent-pools`;
       }

       return (
        <Link 
         key={activity.id} 
         to={linkTo} 
         className="flex items-start gap-3 p-3 hover:bg-slate-50 hover:shadow-sm hover:-translate-y-0.5 transition-all rounded-lg group border border-transparent hover:border-slate-100"
        >
         <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${iconClass}`}>
          <Icon className="h-4 w-4"/>
         </div>
         <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-900 truncate group-hover:text-primary transition-colors">
           {titleText}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center justify-between gap-2">
           <span className="truncate flex-1">{subtitleText}</span>
           <span className="shrink-0 whitespace-nowrap text-slate-400 text-[10px] uppercase tracking-wider">{formatDateTime(activity.timestamp)}</span>
          </p>
         </div>
        </Link>
       )
      })}
     </div>
    )}
   </div>
  </div>
 )
}
