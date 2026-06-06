"""Job specific services."""

"""Job specific services."""

def generate_job_description(title, experience_level, salary_range, location, job_type, skills):
    """
    Generates a professional job description draft based on the provided inputs.
    """
    skill_names = [s.get('name', '') for s in skills] if isinstance(skills, list) else []
    skills_str = ", ".join(skill_names) if skill_names else "relevant industry skills"
    
    title_str = title if title else "Open Position"
    exp_str = experience_level if experience_level else "demonstrated"
    
    draft = f"## About the Role\n"
    draft += f"We are actively seeking a talented and motivated {title_str} to join our growing team. "
    draft += f"In this {job_type or 'full-time'} role based in {location or 'our primary office'}, you will be instrumental in driving our core projects forward and collaborating with cross-functional teams to deliver high-quality solutions.\n\n"
    
    draft += f"## Key Responsibilities\n"
    draft += f"- Lead the design, development, and implementation of critical systems and features.\n"
    draft += f"- Collaborate closely with product managers, designers, and other engineers.\n"
    draft += f"- Ensure best practices in architecture, performance, and code quality.\n"
    draft += f"- Mentor junior team members and contribute to a culture of continuous learning.\n\n"
    
    draft += f"## Required Qualifications\n"
    draft += f"- {exp_str.capitalize()} experience working in a similar {title_str} capacity.\n"
    draft += f"- Strong proficiency and hands-on experience with {skills_str}.\n"
    draft += f"- Excellent problem-solving abilities and a strong attention to detail.\n"
    draft += f"- Effective communication skills and the ability to work in a dynamic team environment.\n\n"
    
    draft += f"## What We Offer\n"
    if salary_range:
        draft += f"- Competitive compensation package: {salary_range}.\n"
    else:
        draft += f"- Competitive compensation package commensurate with experience.\n"
        
    draft += f"- Comprehensive health, dental, and vision insurance.\n"
    draft += f"- Flexible working hours and a supportive, inclusive culture.\n"
    draft += f"- Opportunities for professional growth and continuous learning.\n"
    
    return {
        "drafted_description": draft
    }
