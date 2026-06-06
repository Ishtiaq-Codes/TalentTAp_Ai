"""Job specific services."""

def analyze_job_description(title, description, skills):
    """
    Analyzes a job description against the candidate pool to provide optimization suggestions.
    """
    from apps.candidates.models import CandidateProfile
    from sklearn.feature_extraction.text import TfidfVectorizer
    import re
    
    # Get top 50 highly complete candidates in the system
    top_candidates = CandidateProfile.objects.filter(
        profile_completion__gte=70,
        is_open_to_work=True
    ).prefetch_related('skills')[:50]
    
    if not top_candidates:
        return {
            "suggestions": ["Add more details to attract top talent. No comparable profiles found to optimize against."],
            "recommended_skills": []
        }
        
    all_skills_in_pool = {}
    for c in top_candidates:
        for s in c.skills.all():
            skill_name = s.name.lower()
            all_skills_in_pool[skill_name] = all_skills_in_pool.get(skill_name, 0) + 1
            
    # Find common skills we are missing
    existing_skills = [s.get('name', '').lower() for s in skills] if isinstance(skills, list) else []
    
    recommended = []
    for skill_name, count in sorted(all_skills_in_pool.items(), key=lambda x: x[1], reverse=True):
        if skill_name not in existing_skills and count >= 5: # At least 5 top candidates have it
            recommended.append(skill_name.title())
        if len(recommended) >= 5:
            break
            
    # Basic text analysis
    suggestions = []
    
    word_count = len(re.findall(r'\w+', description))
    if word_count < 50:
        suggestions.append("Your job description is very short. Top performing posts typically have 150-300 words outlining responsibilities and culture.")
    elif word_count > 500:
        suggestions.append("Your job description is quite long. Consider using bullet points to make it more scannable for candidates.")
        
    if recommended:
        suggestions.append(f"Consider adding these skills: {', '.join(recommended[:3])}. Many top candidates in our pool possess these.")
        
    if 'salary' not in description.lower() and 'compensation' not in description.lower():
        suggestions.append("Job posts that include a salary range or compensation details receive 35% more applications from top-tier talent.")
        
    if not suggestions:
        suggestions.append("Your job post looks strong and well-optimized!")
        
    return {
        "suggestions": suggestions,
        "recommended_skills": recommended
    }
