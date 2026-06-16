import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Award, Briefcase, Sparkles, X, ArrowRight } from 'lucide-react';
import ProfileAvatar from '@/components/common/ProfileAvatar';
import ShortlistButton from '@/components/common/ShortlistButton';
import MessageButton from '@/components/common/MessageButton';
import AvailabilityBadge from '@/components/common/AvailabilityBadge';
import { getImageUrl } from '@/lib/utils';

function ProficiencyDots({ level }) {
 const levels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 }
 const n = levels[level] || 2
 return (
  <div className="flex gap-0.5">
   {[1,2,3,4].map(i => (
    <div key={i} className={`h-1.5 w-3 rounded-full ${i <= n ? 'bg-primary' : 'bg-slate-200'}`} />
   ))}
  </div>
 )
}



export default function CandidatePreviewDrawer({ selected, selectedJobId, onClose }) {
  if (!selected) return null;

  return (
    <div className="fixed inset-0 z-40 lg:relative lg:z-auto lg:w-[420px] shrink-0 flex">
      <div className="absolute inset-0 bg-black/40 lg:hidden" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-md lg:max-w-none h-full overflow-y-auto rounded-xl border bg-white shadow-xl lg:shadow-sm flex flex-col animate-in slide-in-from-right-8 lg:animate-none">
        <div className="relative shrink-0">
          <div className="h-28 bg-gradient-to-r from-primary/20 to-blue-500/20">
            {selected.banner_image && (
              <img src={getImageUrl(selected.banner_image)} alt="" className="h-full w-full object-cover"/>
            )}
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur text-slate-600 hover:bg-white transition-all shadow-sm"
          >
            <X className="h-4 w-4"/>
          </button>
          <div className="px-5 -mt-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
              <ProfileAvatar name={selected.user_name} src={selected.avatar} size="lg" className="h-full w-full"/>
            </div>
          </div>
        </div>

        <div className="flex-1 px-5 pb-5 space-y-5">
          <div className="pt-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{selected.user_name}</h2>
              {selected.is_flight_risk && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 cursor-help" title="Passive Talent: Currently employed with 2+ years of experience, but recently updated their profile. High potential for headhunting!">
                  🚀 Passive Talent
                </span>
              )}
              {selected.verified_expert && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 ring-1 ring-inset ring-amber-600/30 shadow-sm border border-amber-200" title="Top 1% AI Verified Talent">
                  <Award className="w-3 h-3 text-amber-600" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{selected.headline || 'Professional'}</p>

            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-500">
              {(selected.city || selected.country) && (
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/> {selected.city}{selected.city && selected.country ? ', ' : ''}{selected.country}</span>
              )}
              {selected.years_of_experience > 0 && (
                <span className="flex items-center gap-1"><Award className="h-3 w-3"/> {selected.years_of_experience} years exp</span>
              )}
              {selected.employment_status && (
                <span className="flex items-center gap-1"><Briefcase className="h-3 w-3"/> {selected.employment_status.replace(/_/g, ' ')}</span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/recruiter/candidates/${selected.id}${selectedJobId ? `?job_id=${selectedJobId}` : ''}`}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-all"
            >
              View Full Profile <ArrowRight className="h-3.5 w-3.5"/>
            </Link>
            <div className="shrink-0" id={`shortlist-btn-${selected.id}`}>
              <ShortlistButton candidateId={selected.id} initialIsShortlisted={selected.is_shortlisted} />
            </div>
          </div>

          <div className="flex gap-2">
            <MessageButton recipientId={selected.user_id} name={selected.user_name || 'Candidate'} className="flex-1 justify-center text-sm"/>
          </div>

          <div className="flex flex-wrap gap-2">
            <AvailabilityBadge availability={selected.availability} />
            {selected.employment_type_preferred && (
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20 uppercase tracking-wider">
                <Briefcase className="h-2.5 w-2.5"/> {selected.employment_type_preferred.replace(/_/g, ' ')}
              </span>
            )}
            {selected.is_open_to_work && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 uppercase tracking-wider">
                <Sparkles className="h-2.5 w-2.5"/> Open to work
              </span>
            )}
          </div>

          {selected.skills?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Skills</h3>
              <div className="space-y-2">
                {selected.skills.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <span className="truncate">{s.name || s}</span>
                      {s.is_verified_by_ai && <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" title="AI Verified Expert" />}
                    </span>
                    <ProficiencyDots level={s.proficiency} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
