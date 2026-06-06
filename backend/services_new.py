"""Matching service — orchestrates engine runs using multithreading."""
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from apps.candidates.models import CandidateProfile
from apps.notifications.models import Notification
from .models import MatchScore
from .engine import compute_match

logger = logging.getLogger(__name__)

def run_matching_for_job(job):
    """Run the matching engine for a job against all open candidates concurrently."""
    candidates = list(CandidateProfile.objects.filter(
        is_open_to_work=True,
    ).prefetch_related('skills'))

    results = []
    
    def process_candidate(candidate):
        try:
            match_data = compute_match(candidate, job)
            score, _ = MatchScore.objects.update_or_create(
                job=job,
                candidate=candidate,
                defaults=match_data,
            )
            
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
            return score
        except Exception as e:
            logger.error(f"Error processing candidate {candidate.id}: {e}")
            return None

    # Use ThreadPoolExecutor to make Gemini calls in parallel
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(process_candidate, c) for c in candidates]
        for future in as_completed(futures):
            res = future.result()
            if res:
                results.append(res)

    return sorted(results, key=lambda s: s.overall_score, reverse=True)


def run_matching_for_candidate(candidate):
    """Run the matching engine for a candidate against all active jobs concurrently."""
    from apps.jobs.models import Job
    
    if not candidate.is_open_to_work:
        return []

    jobs = list(Job.objects.filter(status='active').prefetch_related('skills'))

    results = []
    
    def process_job(job):
        try:
            match_data = compute_match(candidate, job)
            score, _ = MatchScore.objects.update_or_create(
                job=job,
                candidate=candidate,
                defaults=match_data,
            )
            return score
        except Exception as e:
            logger.error(f"Error processing job {job.id}: {e}")
            return None

    # Use ThreadPoolExecutor to make Gemini calls in parallel
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(process_job, j) for j in jobs]
        for future in as_completed(futures):
            res = future.result()
            if res:
                results.append(res)

    return sorted(results, key=lambda s: s.overall_score, reverse=True)
