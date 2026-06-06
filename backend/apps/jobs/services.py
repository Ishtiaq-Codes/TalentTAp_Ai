"""Job specific services."""

"""Job specific services."""

from apps.core.llm import generate_text

def generate_job_description(title, experience_level, salary_range, location, job_type, skills):
    """
    Generates a professional job description draft using Gemini AI based on the provided inputs.
    """
    skill_names = [s.get('name', '') for s in skills] if isinstance(skills, list) else []
    skills_str = ", ".join(skill_names) if skill_names else "relevant industry skills"
    
    title_str = title if title else "Open Position"
    exp_str = experience_level if experience_level else "Not specified"
    loc_str = location if location else "Flexible"
    type_str = job_type if job_type else "Full-time"
    sal_str = salary_range if salary_range else "Competitive based on experience"
    
    prompt = f"""
Act as an expert technical recruiter.
Write a VERY SHORT, punchy, and scannable job description for a "{title_str}" role.

Details:
- Experience level: {exp_str}
- Location: {loc_str}
- Job Type: {type_str}
- Compensation: {sal_str}
- Key Skills: {skills_str}

Format the output strictly in Markdown using the following structure:
## About the Role
(Max 2 short sentences here)

## Key Responsibilities
(Max 3 short bullet points)

## Required Qualifications
(Max 3 short bullet points)

## What We Offer
(Max 2 short bullet points based on compensation)

CRITICAL: Keep it extremely brief. A human must be able to read the entire thing in 10 seconds. Do not include any placeholders or introductory phrases.
"""
    
    draft = generate_text(prompt, temperature=0.5)
    
    return {
        "drafted_description": draft.strip()
    }
