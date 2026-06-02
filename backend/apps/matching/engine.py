"""
AI Matching Engine — Rule-based scoring system.

Computes a weighted score across 5 dimensions:
  Skills (40%), Experience (25%), Location (15%),
  Availability (10%), Employment Type (10%).

Architecture supports future replacement with embeddings/LLM.
"""

WEIGHTS = {
    'skills': 0.40,
    'experience': 0.25,
    'location': 0.15,
    'availability': 0.10,
    'employment_type': 0.10,
}

AVAILABILITY_SCORES = {
    'immediate': 100,
    '2_weeks': 90,
    '1_month': 70,
    '3_months': 40,
    'not_available': 0,
}


def score_skills(candidate_skills, job_skills):
    """Score skill overlap between candidate and job.

    Returns:
        dict with score, matched, missing, and nice_to_have info.
    """
    candidate_set = {s.name.lower() for s in candidate_skills}
    required = [s for s in job_skills if s.is_required]
    nice_to_have = [s for s in job_skills if not s.is_required]

    if not required and not nice_to_have:
        return {'score': 50, 'matched': [], 'missing': [], 'detail': 'No skills specified'}

    # Required skills: 80% weight
    matched_required = [s.name for s in required if s.name.lower() in candidate_set]
    required_score = (len(matched_required) / len(required) * 80) if required else 40

    # Nice-to-have: 20% weight
    matched_nice = [s.name for s in nice_to_have if s.name.lower() in candidate_set]
    nice_score = (len(matched_nice) / len(nice_to_have) * 20) if nice_to_have else 10

    missing = [s.name for s in required if s.name.lower() not in candidate_set]

    return {
        'score': round(required_score + nice_score, 2),
        'matched': matched_required + matched_nice,
        'missing': missing,
    }


def score_experience(candidate_years, exp_min, exp_max):
    """Score candidate experience vs job requirements."""
    if exp_min == 0 and exp_max == 0:
        return {'score': 80, 'candidate_years': candidate_years, 'required': 'Any'}

    if exp_min <= candidate_years <= exp_max:
        score = 100
    elif candidate_years > exp_max:
        score = max(70, 100 - (candidate_years - exp_max) * 5)
    else:
        score = max(0, (candidate_years / exp_min * 80)) if exp_min else 60

    return {
        'score': round(score, 2),
        'candidate_years': candidate_years,
        'required': f'{exp_min}-{exp_max} years',
    }


def score_location(candidate_country, candidate_city, job_country, job_city, job_remote):
    """Score location compatibility."""
    if job_remote == 'remote':
        return {'score': 100, 'reason': 'Remote position'}

    if candidate_country.lower() == job_country.lower() and candidate_city.lower() == job_city.lower():
        return {'score': 100, 'reason': 'Same city'}

    if candidate_country.lower() == job_country.lower():
        return {'score': 70, 'reason': 'Same country, different city'}

    return {'score': 30, 'reason': 'Different country'}


def score_availability(candidate_availability):
    """Score candidate availability."""
    score = AVAILABILITY_SCORES.get(candidate_availability, 50)
    return {'score': score, 'candidate': candidate_availability}


def score_employment_type(candidate_pref, job_type):
    """Score employment type match."""
    if candidate_pref == job_type:
        return {'score': 100, 'match': job_type}
    return {'score': 40, 'candidate_pref': candidate_pref, 'job_type': job_type}


def compute_match(candidate, job):
    """Compute full match score between a candidate and a job.

    Args:
        candidate: CandidateProfile instance (with skills prefetched)
        job: Job instance (with skills prefetched)

    Returns:
        dict with overall_score and per-dimension breakdown.
    """
    candidate_skills = candidate.skills.all()
    job_skills = job.skills.all()

    breakdown = {
        'skills': score_skills(candidate_skills, job_skills),
        'experience': score_experience(
            candidate.years_of_experience, job.experience_min, job.experience_max,
        ),
        'location': score_location(
            candidate.country or '', candidate.city or '',
            job.country or '', job.city or '', job.is_remote,
        ),
        'availability': score_availability(candidate.availability),
        'employment_type': score_employment_type(
            candidate.employment_type_preferred, job.employment_type,
        ),
    }

    # Add weights to breakdown for transparency
    for key in breakdown:
        breakdown[key]['weight'] = WEIGHTS[key]

    overall = sum(
        breakdown[key]['score'] * WEIGHTS[key]
        for key in WEIGHTS
    )

    return {
        'overall_score': round(overall, 2),
        'skills_score': breakdown['skills']['score'],
        'experience_score': breakdown['experience']['score'],
        'location_score': breakdown['location']['score'],
        'availability_score': breakdown['availability']['score'],
        'employment_type_score': breakdown['employment_type']['score'],
        'breakdown': breakdown,
    }
