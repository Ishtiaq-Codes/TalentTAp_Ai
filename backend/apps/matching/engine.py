"""
AI Matching Engine — Advanced NLP & Cognitive Scoring.

Powered by Gemini LLM for deep semantic reasoning, with a 
TF-IDF/Fuzzy fallback for offline environments.
"""
import re
import logging
from thefuzz import fuzz
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from apps.core.llm import HAS_GEMINI, generate_json

logger = logging.getLogger(__name__)

# -------------------------------------------------------------------------
# TRUE AI MATCHING (GEMINI)
# -------------------------------------------------------------------------

def compute_match_llm(candidate, job):
    """Compute cognitive match score using Gemini 2.5."""
    candidate_skills = ", ".join([f"{s.name} (AI Verified Expert)" if s.is_verified_by_ai else s.name for s in candidate.skills.all()])
    job_skills = ", ".join([s.name for s in job.skills.all()])
    
    candidate_exps = "\n".join([
        f"- {e.title} at {e.company_name} ({e.start_date} to {e.end_date}): {e.description}"
        for e in candidate.experiences.all()
    ])
    
    from django.utils import timezone
    from datetime import timedelta
    thirty_days_ago = timezone.now() - timedelta(days=30)
    has_cheated = candidate.interviews.filter(status='failed_cheating', created_at__gte=thirty_days_ago).exists()
    
    cheater_warning = ""
    if has_cheated:
        cheater_warning = "\nCRITICAL WARNING: This candidate was caught cheating in a recent AI interview. You MUST deduct at least 50 points from their overall_score and mention this cheating offense as the first item in missing_factors."
    
    prompt = f"""
You are an elite Senior Executive Technical Recruiter. Your task is to deeply analyze the fit between a Candidate Profile and a Job Description.
Do not just look for exact keyword matches. Use semantic reasoning. If they know 'Next.js', they inherently know 'React'. Evaluate their seniority, trajectory, and soft skills based on their bio and experience descriptions.{cheater_warning}

JOB PROFILE:
Title: {job.title}
Employment Type: {job.employment_type}
Location: {job.city}, {job.country} ({'Remote' if job.is_remote else 'On-site'})
Required Experience: {job.experience_min} to {job.experience_max} years
Skills Needed: {job_skills}
Description: {job.description}

CANDIDATE PROFILE:
Name: {candidate.user.first_name} {candidate.user.last_name}
Headline: {candidate.headline}
Bio: {candidate.about}
Location: {candidate.city}, {candidate.country}
Availability: {candidate.availability}
Preferred Emp Type: {candidate.employment_type_preferred}
Total Experience: {candidate.years_of_experience} years
Skills: {candidate_skills}

EXPERIENCE HISTORY:
{candidate_exps}

OUTPUT STRICT JSON MATCHING THIS EXACT SCHEMA:
{{
  "overall_score": 0.0 to 100.0,
  "skills_score": 0.0 to 100.0,
  "experience_score": 0.0 to 100.0,
  "location_score": 0.0 to 100.0,
  "availability_score": 0.0 to 100.0,
  "employment_type_score": 0.0 to 100.0,
  "breakdown": {{
    "match_reason": "A highly tailored, human-like paragraph explaining why they are or aren't a fit.",
    "relevance_factors": [
       "Strong match: ...",
       "Implied skill: ..."
    ],
    "missing_factors": [
       "Missing requirement: ..."
    ]
  }}
}}
"""
    result = generate_json(prompt, model_name="llama-3.1-8b-instant", temperature=0.1)
    
    if not result or 'overall_score' not in result:
        logger.error("LLM matching failed, falling back to legacy algorithm.")
        return compute_match_fallback(candidate, job)
        
    return {
        'overall_score': round(float(result.get('overall_score', 0)), 2),
        'skills_score': round(float(result.get('skills_score', 0)), 2),
        'experience_score': round(float(result.get('experience_score', 0)), 2),
        'location_score': round(float(result.get('location_score', 0)), 2),
        'availability_score': round(float(result.get('availability_score', 0)), 2),
        'employment_type_score': round(float(result.get('employment_type_score', 0)), 2),
        'breakdown': result.get('breakdown', {})
    }


# -------------------------------------------------------------------------
# LEGACY FALLBACK (TF-IDF + FUZZY)
# -------------------------------------------------------------------------

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

LOCATION_ALIASES = {
    'us': 'united states', 'usa': 'united states', 'uk': 'united kingdom',
    'uae': 'united arab emirates', 'nyc': 'new york', 'sf': 'san francisco',
}

def normalize_text(text):
    if not text: return ""
    text = str(text).lower().strip()
    text = re.sub(r'[^\w\s]', '', text)
    return LOCATION_ALIASES.get(text, text)

def compute_semantic_alignment(candidate_text, job_text):
    if not candidate_text.strip() or not job_text.strip(): return 50.0
    try:
        vectorizer = TfidfVectorizer(stop_words='english', max_features=500)
        tfidf_matrix = vectorizer.fit_transform([candidate_text, job_text])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return min(100.0, float(similarity) * 250.0)
    except Exception:
        return 50.0

def compute_match_fallback(candidate, job):
    """Compute full match score using basic AI/NLP heuristics (Fallback)."""
    # 1. Skills
    candidate_skills = candidate.skills.all()
    required = [s.name for s in job.skills.all() if s.is_required]
    
    matched_req = []
    effective_matched_count = 0.0
    
    for r in required:
        best_match_score = 0
        is_verified = False
        for c in candidate_skills:
            score = fuzz.token_sort_ratio(r.lower(), c.name.lower())
            if score > best_match_score:
                best_match_score = score
                is_verified = c.is_verified_by_ai
        if best_match_score >= 80:
            matched_req.append(r)
            effective_matched_count += 1.3 if is_verified else 1.0
            
    missing_req = [r for r in required if r not in matched_req]
    skills_score = min(100.0, (effective_matched_count / len(required) * 100)) if required else 50.0

    # 2. Experience
    candidate_years = candidate.years_of_experience or 0
    exp_min = job.experience_min or 0
    exp_max = job.experience_max or 0
    
    if exp_min == 0 and exp_max == 0: years_score = 80
    elif exp_min <= candidate_years <= exp_max: years_score = 100
    elif candidate_years > exp_max: years_score = max(70, 100 - (candidate_years - exp_max) * 5)
    else: years_score = max(0, (candidate_years / exp_min * 85)) if exp_min else 60

    candidate_text = f"{candidate.headline or ''} {candidate.about or ''} " + " ".join([f"{e.title} {e.description}" for e in candidate.experiences.all()])
    job_text = f"{job.title} {job.description}"
    semantic_score = compute_semantic_alignment(candidate_text, job_text)
    experience_score = (years_score * 0.4) + (semantic_score * 0.6)

    # 3. Location
    if job.is_remote == 'remote': location_score = 100.0
    else:
        cc, jc = normalize_text(candidate.country), normalize_text(job.country)
        location_score = 100.0 if cc == jc and normalize_text(candidate.city) == normalize_text(job.city) else (70.0 if cc == jc else 30.0)

    # 4. Availability & Emp Type
    availability_score = AVAILABILITY_SCORES.get(candidate.availability, 50)
    employment_type_score = 100.0 if candidate.employment_type_preferred == job.employment_type else 50.0

    overall = (skills_score * WEIGHTS['skills']) + (experience_score * WEIGHTS['experience']) + \
              (location_score * WEIGHTS['location']) + (availability_score * WEIGHTS['availability']) + \
              (employment_type_score * WEIGHTS['employment_type'])
              
    from django.utils import timezone
    from datetime import timedelta
    thirty_days_ago = timezone.now() - timedelta(days=30)
    has_cheated = candidate.interviews.filter(status='failed_cheating', created_at__gte=thirty_days_ago).exists()
    
    if has_cheated:
        overall = max(0.0, overall - 30.0)

    breakdown = {
        'match_reason': f"Matched with a fallback organic score of {overall:.1f}%.",
        'relevance_factors': [f"Matches {m}" for m in matched_req[:3]],
        'missing_factors': [f"Missing {m}" for m in missing_req[:3]]
    }
    
    if has_cheated:
        breakdown['missing_factors'].insert(0, "CRITICAL: Caught cheating in a recent AI Interview.")

    return {
        'overall_score': round(overall, 2),
        'skills_score': round(skills_score, 2),
        'experience_score': round(experience_score, 2),
        'location_score': round(location_score, 2),
        'availability_score': round(availability_score, 2),
        'employment_type_score': round(employment_type_score, 2),
        'breakdown': breakdown,
    }


def compute_match(candidate, job):
    """Main entrypoint: Uses TF-IDF fallback for background processing."""
    return compute_match_fallback(candidate, job)

# -------------------------------------------------------------------------
# BATCH AI MATCHING (ON-DEMAND)
# -------------------------------------------------------------------------

def batch_evaluate_candidates_llm(job, candidates):
    """Batch evaluate multiple candidates for a single job."""
    if not candidates or not HAS_GEMINI:
        return {}
        
    job_skills = ", ".join([s.name for s in job.skills.all()])
    
    candidates_text = ""
    for c in candidates:
        candidate_skills = ", ".join([s.name for s in c.skills.all()])
        candidate_exps = " | ".join([f"{e.title} at {e.company_name} ({e.start_date} to {e.end_date}): {e.description}" for e in c.experiences.all()[:3]])
        candidates_text += f"\n--- CANDIDATE ID: {c.id} ---\nName: {c.user.first_name}\nHeadline: {c.headline}\nYears Exp: {c.years_of_experience}\nSkills: {candidate_skills}\nExperience: {candidate_exps}\n"

    prompt = f"""
You are an elite Senior Executive Technical Recruiter. You must evaluate the fit between ONE Job and MULTIPLE Candidates.
Use semantic reasoning. Evaluate their seniority, trajectory, and soft skills based on their bio and experience descriptions.

JOB PROFILE:
Title: {job.title}
Employment Type: {job.employment_type}
Required Experience: {job.experience_min} to {job.experience_max} years
Skills Needed: {job_skills}
Description: {job.description}

CANDIDATES:{candidates_text}

OUTPUT STRICT JSON MATCHING THIS EXACT SCHEMA (Array of objects):
[
  {{
    "candidate_id": "UUID string here",
    "ranking_score": 0.0 to 100.0,
    "match_reason": "A tailored, 2-sentence paragraph explaining why they are or aren't a fit.",
    "relevance_factors": ["Strong match: ...", "Implied skill: ..."]
  }}
]
"""
    result_list = generate_json(prompt, model_name="llama-3.1-8b-instant", temperature=0.1)
    
    if not result_list or not isinstance(result_list, list):
        return {}
        
    mapping = {}
    for item in result_list:
        cid = item.get("candidate_id")
        if cid:
            mapping[str(cid)] = {
                "ranking_score": round(float(item.get("ranking_score", 0)), 2),
                "match_reason": item.get("match_reason", ""),
                "relevance_factors": item.get("relevance_factors", [])
            }
    return mapping


def batch_evaluate_jobs_llm(candidate, jobs):
    """Batch evaluate multiple jobs for a single candidate."""
    if not jobs or not HAS_GEMINI:
        return {}
        
    candidate_skills = ", ".join([s.name for s in candidate.skills.all()])
    candidate_exps = " | ".join([f"{e.title} at {e.company_name}" for e in candidate.experiences.all()[:3]])
    
    jobs_text = ""
    for j in jobs:
        job_skills = ", ".join([s.name for s in j.skills.all()])
        company_name = j.company.name if getattr(j, 'company', None) else ""
        jobs_text += f"\n--- JOB ID: {j.id} ---\nTitle: {j.title}\nCompany: {company_name}\nRequired Exp: {j.experience_min}-{j.experience_max} years\nSkills: {job_skills}\nDescription: {j.description[:200]}...\n"

    prompt = f"""
You are an elite Senior Executive Technical Recruiter. You must evaluate the fit between ONE Candidate and MULTIPLE Jobs.
Use semantic reasoning. Evaluate their seniority and skills.

CANDIDATE PROFILE:
Name: {candidate.user.first_name}
Headline: {candidate.headline}
Total Experience: {candidate.years_of_experience} years
Skills: {candidate_skills}
Experience: {candidate_exps}

JOBS:{jobs_text}

OUTPUT STRICT JSON MATCHING THIS EXACT SCHEMA (Array of objects):
[
  {{
    "job_id": "UUID string here",
    "ranking_score": 0.0 to 100.0,
    "match_reason": "A tailored, 2-sentence paragraph explaining why this job is a good fit.",
    "relevance_factors": ["Matches skill: ...", "Experience aligns: ..."]
  }}
]
"""
    result_list = generate_json(prompt, model_name="llama-3.1-8b-instant", temperature=0.1)
    
    if not result_list or not isinstance(result_list, list):
        return {}
        
    mapping = {}
    for item in result_list:
        jid = item.get("job_id")
        if jid:
            mapping[str(jid)] = {
                "ranking_score": round(float(item.get("ranking_score", 0)), 2),
                "match_reason": item.get("match_reason", ""),
                "relevance_factors": item.get("relevance_factors", [])
            }
    return mapping

