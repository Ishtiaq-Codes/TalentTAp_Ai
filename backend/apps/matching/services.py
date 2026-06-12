"""Matching service — orchestrates engine runs."""
from apps.candidates.models import CandidateProfile
from apps.notifications.models import Notification
from .models import MatchScore
from .engine import compute_match
import threading
import time
import logging
from django.core.mail import send_mail
from django.conf import settings
from apps.core.llm import generate_text

logger = logging.getLogger(__name__)


def run_matching_for_job(job):
    """Run the matching engine for a job against all open candidates.

    Returns:
        list of created/updated MatchScore instances.
    """
    candidates = CandidateProfile.objects.filter(
        is_open_to_work=True,
    ).prefetch_related('skills')

    results = []
    for candidate in candidates:
        match_data = compute_match(candidate, job)
        score, created = MatchScore.objects.update_or_create(
            job=job,
            candidate=candidate,
            defaults=match_data,
        )
        
        # Trigger notification if score is high and it's a new or significantly updated match
        if score.overall_score >= 75:
            exists = Notification.objects.filter(
                user=job.recruiter.user,
                type=Notification.Type.MATCH,
                message=f'Candidate {candidate.user.full_name} matched for your {job.title} post.'
            ).exists()
            
            if not exists:
                from apps.notifications.services import notify
                notify(
                    user=job.recruiter.user,
                    notification_type=Notification.Type.MATCH,
                    title=f'New High Match: {score.overall_score}%',
                    message=f'Candidate {candidate.user.full_name} matched for your {job.title} post.',
                    action_url=f'/recruiter/candidates/{candidate.id}'
                )

        results.append(score)

    sorted_results = sorted(results, key=lambda s: s.overall_score, reverse=True)
    
    # Trigger auto headhunter if enabled
    if getattr(job, 'auto_headhunt', False) and job.status == 'active':
        trigger_auto_headhunter_async(job.id)
        
    return sorted_results

def trigger_auto_headhunter_async(job_id):
    def _headhunt():
        from apps.jobs.models import Job
        from apps.matching.models import MatchScore
        from apps.notifications.services import notify
        from apps.notifications.models import Notification
        
        try:
            job = Job.objects.get(id=job_id)
            if not getattr(job, 'auto_headhunt', False) or job.status != 'active':
                return
                
            # Get top passive candidates (score >= 90)
            top_matches = MatchScore.objects.filter(
                job=job,
                overall_score__gte=90
            ).select_related('candidate__user', 'job__company').order_by('-overall_score')[:10]
            
            for match in top_matches:
                candidate = match.candidate
                
                # Check if already headhunted for this job
                if Notification.objects.filter(
                    user=candidate.user,
                    type=Notification.Type.SYSTEM,
                    title=f'You were headhunted by {job.company.name}!',
                    action_url=f'/jobs/{job.slug}'
                ).exists():
                    continue
                
                # Draft email
                recruiter_name = job.recruiter.user.full_name if job.recruiter else "The TalentTap Recruiting Team"
                prompt = f"""
Act as an elite tech recruiter named {recruiter_name} working for {job.company.name}.
Write a highly personalized, warm, and professional outreach email to a passive candidate named {candidate.user.full_name}.
They are a {match.overall_score}% match for our new "{job.title}" role.

Candidate Skills: {candidate.skills}
Candidate Experience: {candidate.years_of_experience} years

Keep it under 150 words. Be persuasive but respectful of their time.
CRITICAL: Do NOT use ANY placeholders like "[Your Name]" or "[Company]".
Sign off the email explicitly using the name "{recruiter_name}" and mention that you found their profile on the "TalentTap" platform.
"""
                email_body = generate_text(prompt, temperature=0.7)
                
                # Send email via SMTP
                try:
                    send_mail(
                        subject=f'Opportunity: {job.title} at {job.company.name}',
                        message=email_body,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[candidate.user.email],
                        fail_silently=False,
                    )
                except Exception as e:
                    logger.error(f"Failed to send headhunting email: {e}")
                    
                # In-app notification
                notify(
                    user=candidate.user,
                    notification_type=Notification.Type.SYSTEM,
                    title=f'You were headhunted by {job.company.name}!',
                    message=f'Your profile is a {match.overall_score}% match for their new {job.title} role. They have sent you an email!',
                    action_url=f'/jobs/{job.slug}'
                )
                
                # Sleep to avoid API limits (stagger emails)
                time.sleep(60) # 1 minute delay between emails
                
        except Exception as e:
            logger.error(f"Auto-Headhunter error: {e}")
            
    threading.Thread(target=_headhunt).start()

def run_matching_for_candidate(candidate):
    """Run the matching engine for a candidate against all active jobs.
    
    Returns:
        list of created/updated MatchScore instances.
    """
    from apps.jobs.models import Job
    
    if not candidate.is_open_to_work:
        return []

    jobs = Job.objects.filter(status='active').prefetch_related('skills')

    results = []
    for job in jobs:
        match_data = compute_match(candidate, job)
        score, created = MatchScore.objects.update_or_create(
            job=job,
            candidate=candidate,
            defaults=match_data,
        )
        results.append(score)

    return sorted(results, key=lambda s: s.overall_score, reverse=True)

