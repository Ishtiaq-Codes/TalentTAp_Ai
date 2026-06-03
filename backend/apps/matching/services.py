"""Matching service — orchestrates engine runs."""
from apps.candidates.models import CandidateProfile
from apps.notifications.models import Notification
from .models import MatchScore
from .engine import compute_match


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
            Notification.objects.get_or_create(
                user=job.recruiter.user,
                type=Notification.Type.MATCH,
                title=f'New High Match: {score.overall_score}%',
                message=f'Candidate {candidate.user.full_name} matched for your {job.title} post.',
                defaults={'action_url': f'/recruiter/candidates/{candidate.id}'}
            )

        results.append(score)

    return sorted(results, key=lambda s: s.overall_score, reverse=True)
