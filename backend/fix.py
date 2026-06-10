import os

path = r'apps\candidates\services.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('def parse_resume(candidate_id):')
next_def_idx = content.find('\ndef ', start_idx + 10)

if start_idx != -1:
    new_parse_resume = r'''def parse_resume(candidate_id):
    """
    Synchronous task to extract data from a candidate's resume using Groq or Gemini.
    """
    from apps.candidates.models import CandidateProfile, CandidateSkill, Experience, Education, Certification
    import apps.core.llm as llm
    import json
    import logging
    import time
    
    logger = logging.getLogger(__name__)
    
    try:
        profile = CandidateProfile.objects.get(id=candidate_id)
        if not profile.resume:
            return
            
        file_path = profile.resume.path
        text = ''
        
        if getattr(llm, 'HAS_GROQ', False):
            # Read PDF locally for Groq
            try:
                import PyPDF2
                with open(file_path, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    for page in reader.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + '\\n'
            except Exception as e:
                logger.error(f"PyPDF2 Extraction Error: {e}")
                raise Exception("Failed to extract text from PDF for Groq")
                
            prompt = f"""
            You are an expert HR data extractor. Parse the following resume text and extract the data into a JSON object with this EXACT schema:
            {{
                "headline": "A professional headline, e.g. Senior Software Engineer",
                "about": "A short professional summary of the candidate",
                "years_of_experience": 5,
                "phone": "e.g. +1234567890",
                "city": "e.g. San Francisco",
                "github_url": "https://github.com/...",
                "linkedin_url": "https://linkedin.com/in/...",
                "skills": [
                    {{"name": "Python", "proficiency": "expert"}}
                ],
                "experiences": [
                    {{
                        "title": "Software Engineer",
                        "company_name": "Tech Corp",
                        "start_date": "2020-01-01",
                        "end_date": "2023-01-01",
                        "description": "Built cool things."
                    }}
                ],
                "education": [
                    {{
                        "degree": "BSc Computer Science",
                        "institution_name": "University",
                        "start_date": "2015-01-01",
                        "end_date": "2019-01-01"
                    }}
                ],
                "certifications": [
                    {{
                        "name": "AWS Certified Solutions Architect",
                        "issuing_organization": "Amazon",
                        "issue_date": "2021-01-01",
                        "expiration_date": "2024-01-01"
                    }}
                ]
            }}
            Return ONLY valid JSON. No markdown formatting. If a field is missing, leave it empty or null.
            
            RESUME TEXT:
            {text[:15000]}
            """
            
            data = llm.generate_json(prompt, model_name='llama3-8b-8192')
            if not data:
                raise Exception("Groq returned empty JSON")
                
        else:
            # Fallback to Gemini Vision if Groq is not configured
            client = getattr(llm, 'client', None)
            if not client:
                logger.error("No LLM client configured")
                return
                
            gemini_file = client.files.upload(file=file_path)
            prompt = """
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
            Return ONLY valid JSON.
            """
            
            response = None
            for attempt in range(2):
                try:
                    response = client.models.generate_content(
                        model='gemini-2.5-flash',
                        contents=[gemini_file, prompt]
                    )
                    break
                except Exception as e:
                    if '429' in str(e) and attempt == 0:
                        time.sleep(60)
                    else:
                        raise e
            
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

        # Save data to profile
        if data.get('headline'): profile.headline = data['headline']
        if data.get('about'): profile.about = data['about']
        if data.get('github_url'): profile.github_url = data['github_url']
        if data.get('linkedin_url'): profile.linkedin_url = data['linkedin_url']
        if data.get('phone'): profile.phone = data['phone']
        if data.get('city'): profile.city = data['city']
        if 'years_of_experience' in data:
            try:
                profile.years_of_experience = int(data['years_of_experience'])
            except:
                pass
        profile.save()
        
        import re
        def _parse_date(d):
            if not d: return None
            d = str(d).strip().lower()
            if d in ('present', 'current', 'now'): return None
            if re.match(r'^\d{4}-\d{2}-\d{2}$', d): return d
            if re.match(r'^\d{4}-\d{2}$', d): return f"{d}-01"
            if re.match(r'^\d{4}$', d): return f"{d}-01-01"
            return None
        
        for skill in data.get('skills', []):
            if not skill.get('name'): continue
            CandidateSkill.objects.get_or_create(
                candidate=profile,
                name=skill.get('name')[:100],
                defaults={'proficiency': skill.get('proficiency', 'intermediate')[:50]}
            )
            
        for exp in data.get('experiences', []):
            if not exp.get('title') or not exp.get('company_name'): continue
            sd = _parse_date(exp.get('start_date')) or '2000-01-01'
            ed = _parse_date(exp.get('end_date'))
            try:
                Experience.objects.get_or_create(
                    candidate=profile,
                    title=exp.get('title')[:255],
                    company_name=exp.get('company_name')[:255],
                    defaults={'start_date': sd, 'end_date': ed, 'description': exp.get('description', '')}
                )
            except:
                pass
            
        for edu in data.get('education', []):
            if not edu.get('degree') or not edu.get('institution_name'): continue
            sd = _parse_date(edu.get('start_date')) or '2000-01-01'
            ed = _parse_date(edu.get('end_date'))
            try:
                Education.objects.get_or_create(
                    candidate=profile,
                    degree=edu.get('degree')[:255],
                    institution_name=edu.get('institution_name')[:255],
                    defaults={'start_date': sd, 'end_date': ed}
                )
            except:
                pass
            
        for cert in data.get('certifications', []):
            if not cert.get('name') or not cert.get('issuing_organization'): continue
            issue = _parse_date(cert.get('issue_date'))
            expir = _parse_date(cert.get('expiration_date'))
            try:
                Certification.objects.get_or_create(
                    candidate=profile,
                    name=cert.get('name')[:255],
                    issuing_organization=cert.get('issuing_organization')[:255],
                    defaults={'issue_date': issue, 'expiration_date': expir}
                )
            except:
                pass

        from apps.notifications.models import Notification
        Notification.objects.create(
            user=profile.user,
            type='system',
            title='Resume Analyzed 🚀',
            message='Our AI has successfully analyzed your resume and updated your profile with your skills, experience, and education!',
            action_url='/candidate/profile'
        )
            
    except Exception as e:
        logger.error(f"Failed to parse resume with LLM: {e}")
        from apps.candidates.models import CandidateProfile
        profile = CandidateProfile.objects.filter(id=candidate_id).first()
        if profile:
            from apps.notifications.models import Notification
            Notification.objects.create(
                user=profile.user,
                type='system',
                title='Resume Analysis Delayed',
                message='We could not analyze your resume right now because the AI servers are experiencing extreme high demand. Please try again later.',
                action_url='/candidate/profile'
            )
'''

    if next_def_idx != -1:
        new_content = content[:start_idx] + new_parse_resume + content[next_def_idx:]
    else:
        new_content = content[:start_idx] + new_parse_resume
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Successfully rewrote parse_resume in services.py')
else:
    print('Could not find parse_resume.')
