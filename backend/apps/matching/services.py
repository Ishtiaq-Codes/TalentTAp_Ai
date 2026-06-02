"""Matching service — orchestrates engine runs."""
from apps.candidates.models import CandidateProfile
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
        score, _ = MatchScore.objects.update_or_create(
            job=job,
            candidate=candidate,
            defaults=match_data,
        )
        results.append(score)

    return sorted(results, key=lambda s: s.overall_score, reverse=True)
