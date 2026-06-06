import os

code = """
def parse_resume(candidate_id):
    \"\"\"
    Synchronous task to extract data from a candidate's resume using Gemini Vision/Document API.
    \"\"\"
    from apps.candidates.models import CandidateProfile, CandidateSkill, Experience, Education, Certification
    import apps.core.llm as llm
    import json
    import logging
    
    logger = logging.getLogger(__name__)
    
    if getattr(llm, 'client', None) is None:
        logger.error("Gemini client is not configured. Cannot parse resume.")
        return
        
    client = llm.client
    
    try:
        profile = CandidateProfile.objects.get(id=candidate_id)
        if not profile.resume:
            return
            
        file_path = profile.resume.path
        gemini_file = client.files.upload(file=file_path)
        
        prompt = '''
        Parse this resume and extract the data into a JSON object with this EXACT schema:
        {
            "headline": "A professional headline, e.g. Senior Software Engineer",
            "about": "A short professional summary of the candidate",
            "years_of_experience": 5,
            "phone": "e.g. +1234567890",
            "city": "e.g. San Francisco",
            "github_url": "https://github.com/...",
            "linkedin_url": "https://linkedin.com/in/...",
            "skills": [
                {"name": "Python", "proficiency": "expert"}
            ],
            "experiences": [
                {
                    "title": "Software Engineer",
                    "company_name": "Tech Corp",
                    "start_date": "2020-01-01",
                    "end_date": "2023-01-01",
                    "description": "Built cool things."
                }
            ],
            "education": [
                {
                    "degree": "BSc Computer Science",
                    "institution_name": "University",
                    "start_date": "2015-01-01",
                    "end_date": "2019-01-01"
                }
            ],
            "certifications": [
                {
                    "name": "AWS Certified Solutions Architect",
                    "issuing_organization": "Amazon",
                    "issue_date": "2021-01-01",
                    "expiration_date": "2024-01-01"
                }
            ]
        }
        Return ONLY valid JSON. No markdown formatting or code blocks. Do not add any text before or after the JSON.
        For dates, use YYYY-MM-DD format if possible, or null if unknown.
        If a field is completely missing from the resume, leave it as an empty string, null, or empty array.
        '''
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[gemini_file, prompt]
        )
        
        try:
            client.files.delete(name=gemini_file.name)
        except Exception:
            pass
        
        text = response.text.strip()
        if text.startswith('```json'):
            text = text[7:-3]
        elif text.startswith('```'):
            text = text[3:-3]
            
        data = json.loads(text.strip())
        
        if data.get('headline'): profile.headline = data['headline']
        if data.get('about'): profile.about = data['about']
        if data.get('github_url'): profile.github_url = data['github_url']
        if data.get('linkedin_url'): profile.linkedin_url = data['linkedin_url']
        if data.get('phone'): profile.phone = data['phone']
        if data.get('city'): profile.city = data['city']
        if 'years_of_experience' in data:
            try:
                profile.years_of_experience = int(data['years_of_experience'])
            except (ValueError, TypeError):
                pass
        profile.save()
        
        for skill in data.get('skills', []):
            if not skill.get('name'): continue
            CandidateSkill.objects.get_or_create(
                candidate=profile,
                name=skill.get('name')[:100],
                defaults={'proficiency': skill.get('proficiency', 'intermediate')[:50]}
            )
            
        for exp in data.get('experiences', []):
            if not exp.get('title') or not exp.get('company_name'): continue
            sd = exp.get('start_date') if exp.get('start_date') else '2000-01-01'
            ed = exp.get('end_date') if exp.get('end_date') else None
            try:
                Experience.objects.get_or_create(
                    candidate=profile,
                    title=exp.get('title')[:255],
                    company_name=exp.get('company_name')[:255],
                    defaults={'start_date': sd, 'end_date': ed, 'description': exp.get('description', '')}
                )
            except Exception as e:
                logger.error(f"Error saving exp: {e}")
            
        for edu in data.get('education', []):
            if not edu.get('degree') or not edu.get('institution_name'): continue
            sd = edu.get('start_date') if edu.get('start_date') else '2000-01-01'
            ed = edu.get('end_date') if edu.get('end_date') else None
            try:
                Education.objects.get_or_create(
                    candidate=profile,
                    degree=edu.get('degree')[:255],
                    institution_name=edu.get('institution_name')[:255],
                    defaults={'start_date': sd, 'end_date': ed}
                )
            except Exception as e:
                logger.error(f"Error saving edu: {e}")
            
        for cert in data.get('certifications', []):
            if not cert.get('name') or not cert.get('issuing_organization'): continue
            issue = cert.get('issue_date') if cert.get('issue_date') else None
            expir = cert.get('expiration_date') if cert.get('expiration_date') else None
            try:
                Certification.objects.get_or_create(
                    candidate=profile,
                    name=cert.get('name')[:255],
                    issuing_organization=cert.get('issuing_organization')[:255],
                    defaults={'issue_date': issue, 'expiration_date': expir}
                )
            except Exception as e:
                logger.error(f"Error saving cert: {e}")
            
    except Exception as e:
        logger.error(f"Error parsing resume: {e}")
        raise e
"""

with open('apps/candidates/services.py', 'a') as f:
    f.write('\n' + code)
