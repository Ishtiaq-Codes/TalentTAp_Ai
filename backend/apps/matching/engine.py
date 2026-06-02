"""
AI Matching Engine — Advanced NLP & Fuzzy Scoring.

Computes a weighted score across 5 dimensions:
  Skills (40%), Experience (25%), Location (15%),
  Availability (10%), Employment Type (10%).

Uses TF-IDF Cosine Similarity for Experience Alignment and
Fuzzy matching for Skill overlap.
"""
import re
from thefuzz import fuzz
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

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

# Common country/city aliases for location normalization
LOCATION_ALIASES = {
    'us': 'united states',
    'usa': 'united states',
    'uk': 'united kingdom',
    'uae': 'united arab emirates',
    'nyc': 'new york',
    'sf': 'san francisco',
}

def normalize_text(text):
    """Normalize text by lowering, stripping, and mapping aliases."""
    if not text:
        return ""
    text = str(text).lower().strip()
    # Remove basic punctuation
    text = re.sub(r'[^\w\s]', '', text)
    return LOCATION_ALIASES.get(text, text)


def score_skills(candidate_skills, job_skills):
    """Score skill overlap using Fuzzy matching to handle typos and variants.
    
    Returns:
        dict with score, matched, missing, and details.
    """
    candidate_names = [s.name for s in candidate_skills]
    required = [s for s in job_skills if s.is_required]
    nice_to_have = [s for s in job_skills if not s.is_required]

    if not required and not nice_to_have:
        return {'score': 50, 'matched': [], 'missing': [], 'detail': 'No skills specified'}

    matched_required = []
    missing_required = []
    
    # Fuzzy match required skills (Threshold 80)
    for req in required:
        best_ratio = max([fuzz.token_sort_ratio(req.name.lower(), c.lower()) for c in candidate_names], default=0)
        if best_ratio >= 80:
            matched_required.append(req.name)
        else:
            missing_required.append(req.name)

    required_score = (len(matched_required) / len(required) * 80) if required else 40

    # Fuzzy match nice-to-have
    matched_nice = []
    for nice in nice_to_have:
        best_ratio = max([fuzz.token_sort_ratio(nice.name.lower(), c.lower()) for c in candidate_names], default=0)
        if best_ratio >= 80:
            matched_nice.append(nice.name)

    nice_score = (len(matched_nice) / len(nice_to_have) * 20) if nice_to_have else 10

    # Bias mitigation: Boost score slightly if they have tons of other skills
    bonus = min(5, len(candidate_names) * 0.5) 
    final_score = min(100, required_score + nice_score + bonus)

    return {
        'score': round(final_score, 2),
        'matched': matched_required + matched_nice,
        'missing': missing_required,
    }


def compute_semantic_alignment(candidate_text, job_text):
    """Compute TF-IDF cosine similarity between candidate bio and job desc."""
    if not candidate_text.strip() or not job_text.strip():
        return 50.0  # Neutral baseline if missing text
        
    try:
        vectorizer = TfidfVectorizer(stop_words='english', max_features=500)
        tfidf_matrix = vectorizer.fit_transform([candidate_text, job_text])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        # Similarity is 0 to 1. Scale to 0-100.
        return float(similarity * 100)
    except Exception:
        return 50.0


def score_experience(candidate, job):
    """Score candidate experience combining raw years and NLP semantic alignment."""
    candidate_years = candidate.years_of_experience or 0
    exp_min = job.experience_min or 0
    exp_max = job.experience_max or 0
    
    # 1. Base Years Score
    if exp_min == 0 and exp_max == 0:
        years_score = 80
    elif exp_min <= candidate_years <= exp_max:
        years_score = 100
    elif candidate_years > exp_max:
        years_score = max(70, 100 - (candidate_years - exp_max) * 5)
    else:
        # Bias mitigation: don't penalize as harshly for being slightly under
        years_score = max(0, (candidate_years / exp_min * 85)) if exp_min else 60

    # 2. Semantic Alignment Score (NLP)
    candidate_text = f"{candidate.headline or ''} {candidate.about or ''}"
    for exp in candidate.experiences.all():
        candidate_text += f" {exp.title} {exp.description}"
        
    job_text = f"{job.title} {job.description}"
    
    semantic_score = compute_semantic_alignment(candidate_text, job_text)
    
    # 3. Combine (Years = 40%, Semantic Context = 60%)
    # This prevents candidates with 10 years of irrelevant experience from scoring 100%
    final_score = (years_score * 0.4) + (semantic_score * 0.6)
    
    # Boost if semantic alignment is very high but years are slightly short
    if semantic_score > 80 and candidate_years < exp_min:
        final_score = min(100, final_score + 15)

    return {
        'score': round(final_score, 2),
        'candidate_years': candidate_years,
        'semantic_alignment': round(semantic_score, 2),
        'required': f'{exp_min}-{exp_max} years',
    }


def score_location(candidate_country, candidate_city, job_country, job_city, job_remote):
    """Score location using advanced text normalization."""
    if job_remote == 'remote':
        return {'score': 100, 'reason': 'Remote position'}

    c_country = normalize_text(candidate_country)
    c_city = normalize_text(candidate_city)
    j_country = normalize_text(job_country)
    j_city = normalize_text(job_city)

    if not j_country and not j_city:
        return {'score': 100, 'reason': 'No location required'}

    # Exact normalized match
    if c_country == j_country and c_city == j_city:
        return {'score': 100, 'reason': 'Same city'}

    # Country match
    if c_country == j_country:
        return {'score': 70, 'reason': 'Same country, different city'}

    # Fuzzy Country Match (in case of weird aliases)
    if fuzz.ratio(c_country, j_country) > 85:
        return {'score': 65, 'reason': 'Similar country'}

    return {'score': 30, 'reason': 'Different country'}


def score_availability(candidate_availability):
    """Score candidate availability."""
    score = AVAILABILITY_SCORES.get(candidate_availability, 50)
    return {'score': score, 'candidate': candidate_availability}


def score_employment_type(candidate_pref, job_type):
    """Score employment type match."""
    if not candidate_pref:
        return {'score': 50, 'match': 'No preference'}
    if candidate_pref == job_type:
        return {'score': 100, 'match': job_type}
    return {'score': 40, 'candidate_pref': candidate_pref, 'job_type': job_type}


def compute_match(candidate, job):
    """Compute full match score using AI/NLP heuristics.

    Args:
        candidate: CandidateProfile instance
        job: Job instance

    Returns:
        dict with overall_score and per-dimension breakdown.
    """
    candidate_skills = candidate.skills.all()
    job_skills = job.skills.all()

    breakdown = {
        'skills': score_skills(candidate_skills, job_skills),
        'experience': score_experience(candidate, job),
        'location': score_location(
            candidate.country or '', candidate.city or '',
            job.country or '', job.city or '', job.is_remote,
        ),
        'availability': score_availability(candidate.availability),
        'employment_type': score_employment_type(
            candidate.employment_type_preferred, job.employment_type,
        ),
    }

    for key in breakdown:
        breakdown[key]['weight'] = WEIGHTS[key]

    overall = sum(breakdown[key]['score'] * WEIGHTS[key] for key in WEIGHTS)

    return {
        'overall_score': round(overall, 2),
        'skills_score': breakdown['skills']['score'],
        'experience_score': breakdown['experience']['score'],
        'location_score': breakdown['location']['score'],
        'availability_score': breakdown['availability']['score'],
        'employment_type_score': breakdown['employment_type']['score'],
        'breakdown': breakdown,
    }
