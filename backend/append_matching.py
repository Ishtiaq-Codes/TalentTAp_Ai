
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
