import json
import logging
from apps.core import llm

logger = logging.getLogger(__name__)

def compute_match(candidate, job):
    """Compute full match score using Gemini 2.5 Flash.

    Args:
        candidate: CandidateProfile instance
        job: Job instance

    Returns:
        dict with overall_score and per-dimension breakdown.
    """
    if getattr(llm, 'client', None) is None:
        logger.error("Gemini client is not configured. Falling back to 0 score.")
        return _fallback_score()

    try:
        candidate_skills = [s.name for s in candidate.skills.all()]
        job_skills = [s.name for s in job.skills.all()]

        candidate_data = {
            "headline": candidate.headline,
            "about": candidate.about,
            "years_of_experience": candidate.years_of_experience,
            "skills": candidate_skills,
            "country": candidate.country,
            "city": candidate.city,
            "availability": candidate.availability,
            "employment_type_preferred": candidate.employment_type_preferred,
        }

        job_data = {
            "title": job.title,
            "description": job.description,
            "requirements": job.requirements,
            "skills": job_skills,
            "is_remote": job.is_remote,
            "country": job.country,
            "city": job.city,
            "employment_type": job.employment_type,
            "experience_level": job.experience_level,
        }

        prompt = f'''
        You are an elite, strict, and highly accurate Senior Technical Recruiter.
        Evaluate the exact match between this Candidate and this Job.
        
        CANDIDATE:
        {json.dumps(candidate_data, indent=2)}

        JOB:
        {json.dumps(job_data, indent=2)}

        Calculate a strict percentage match (0 to 100) for the following 5 dimensions:
        1. Skills Score (How perfectly do the candidate's skills align with the job requirements?)
        2. Experience Score (Does the candidate have the right years of experience and level?)
        3. Location Score (If the job is onsite/hybrid, are they in the same city/country? If remote, score 100.)
        4. Availability Score (Does their availability fit typical recruiter expectations?)
        5. Employment Type Score (Do they want full-time, part-time, contract, etc., and does it match the job?)

        Then calculate an `overall_score` out of 100 using roughly this weighting:
        Skills 40%, Experience 25%, Location 15%, Availability 10%, Employment Type 10%.
        
        IMPORTANT: Be EXTREMELY strict. If a candidate is missing core required skills, the skills score should be very low (e.g., 20-30). Do not give high scores easily.

        Return ONLY a raw JSON object with this exact schema (no markdown, no backticks, no code blocks):
        {{
            "skills_score": 85,
            "experience_score": 90,
            "location_score": 100,
            "availability_score": 80,
            "employment_type_score": 100,
            "overall_score": 88,
            "justification": "Candidate has excellent Python skills but lacks AWS experience required by the job."
        }}
        '''

        client = llm.client
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt],
            config={
                "temperature": 0.1,
                "response_mime_type": "application/json",
            }
        )

        text = response.text.strip()
        data = json.loads(text)

        # Fallback to defaults if missing
        overall = float(data.get('overall_score', 0))
        
        breakdown = {
            'skills': {'score': float(data.get('skills_score', 0)), 'weight': 0.40},
            'experience': {'score': float(data.get('experience_score', 0)), 'weight': 0.25},
            'location': {'score': float(data.get('location_score', 0)), 'weight': 0.15},
            'availability': {'score': float(data.get('availability_score', 0)), 'weight': 0.10},
            'employment_type': {'score': float(data.get('employment_type_score', 0)), 'weight': 0.10},
            'justification': data.get('justification', '')
        }

        return {
            'overall_score': round(overall, 2),
            'skills_score': breakdown['skills']['score'],
            'experience_score': breakdown['experience']['score'],
            'location_score': breakdown['location']['score'],
            'availability_score': breakdown['availability']['score'],
            'employment_type_score': breakdown['employment_type']['score'],
            'breakdown': breakdown,
        }

    except Exception as e:
        logger.error(f"Error in LLM matching engine: {e}")
        return _fallback_score()


def _fallback_score():
    return {
        'overall_score': 0,
        'skills_score': 0,
        'experience_score': 0,
        'location_score': 0,
        'availability_score': 0,
        'employment_type_score': 0,
        'breakdown': {
            'skills': {'score': 0, 'weight': 0.40},
            'experience': {'score': 0, 'weight': 0.25},
            'location': {'score': 0, 'weight': 0.15},
            'availability': {'score': 0, 'weight': 0.10},
            'employment_type': {'score': 0, 'weight': 0.10},
            'justification': 'Matching engine failed or is unavailable.'
        },
    }
