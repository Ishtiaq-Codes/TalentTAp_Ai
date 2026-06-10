import os

path = r'apps\candidates\services.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Let's replace the whole block starting from '# Save data to profile' to the end of the try block.

start_marker = "# Save data to profile"
end_marker = "from apps.notifications.models import Notification"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    safe_block = """# Save data to profile
        if isinstance(data, dict):
            if data.get('headline'): profile.headline = str(data['headline'])
            if data.get('about'): profile.about = str(data['about'])
            if data.get('github_url'): profile.github_url = str(data['github_url'])
            if data.get('linkedin_url'): profile.linkedin_url = str(data['linkedin_url'])
            if data.get('phone'): profile.phone = str(data['phone'])
            if data.get('city'): profile.city = str(data['city'])
            if 'years_of_experience' in data and data['years_of_experience'] is not None:
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
                if re.match(r'^\\d{4}-\\d{2}-\\d{2}$', d): return d
                if re.match(r'^\\d{4}-\\d{2}$', d): return f"{d}-01"
                if re.match(r'^\\d{4}$', d): return f"{d}-01-01"
                return None
            
            def _safe_str(val, max_len=None, default=''):
                if val is None: return default
                s = str(val).strip()
                if max_len: return s[:max_len]
                return s

            skills_list = data.get('skills')
            if isinstance(skills_list, list):
                for skill in skills_list:
                    if isinstance(skill, str):
                        name = _safe_str(skill, 100)
                        if name:
                            CandidateSkill.objects.get_or_create(candidate=profile, name=name, defaults={'proficiency': 'intermediate'})
                    elif isinstance(skill, dict):
                        name = _safe_str(skill.get('name'), 100)
                        if not name: continue
                        prof = _safe_str(skill.get('proficiency'), 50, 'intermediate')
                        if not prof: prof = 'intermediate'
                        CandidateSkill.objects.get_or_create(candidate=profile, name=name, defaults={'proficiency': prof})
                
            exp_list = data.get('experiences')
            if isinstance(exp_list, list):
                for exp in exp_list:
                    if not isinstance(exp, dict): continue
                    title = _safe_str(exp.get('title'), 255)
                    company = _safe_str(exp.get('company_name'), 255)
                    if not title or not company: continue
                    sd = _parse_date(exp.get('start_date')) or '2000-01-01'
                    ed = _parse_date(exp.get('end_date'))
                    desc = _safe_str(exp.get('description'))
                    try:
                        Experience.objects.get_or_create(
                            candidate=profile, title=title, company_name=company,
                            defaults={'start_date': sd, 'end_date': ed, 'description': desc}
                        )
                    except:
                        pass
                
            edu_list = data.get('education')
            if isinstance(edu_list, list):
                for edu in edu_list:
                    if not isinstance(edu, dict): continue
                    degree = _safe_str(edu.get('degree'), 255)
                    inst = _safe_str(edu.get('institution_name'), 255)
                    if not degree or not inst: continue
                    sd = _parse_date(edu.get('start_date')) or '2000-01-01'
                    ed = _parse_date(edu.get('end_date'))
                    try:
                        Education.objects.get_or_create(
                            candidate=profile, degree=degree, institution_name=inst,
                            defaults={'start_date': sd, 'end_date': ed}
                        )
                    except:
                        pass
                
            cert_list = data.get('certifications')
            if isinstance(cert_list, list):
                for cert in cert_list:
                    if not isinstance(cert, dict): continue
                    name = _safe_str(cert.get('name'), 255)
                    org = _safe_str(cert.get('issuing_organization'), 255)
                    if not name or not org: continue
                    issue = _parse_date(cert.get('issue_date'))
                    expir = _parse_date(cert.get('expiration_date'))
                    try:
                        Certification.objects.get_or_create(
                            candidate=profile, name=name, issuing_organization=org,
                            defaults={'issue_date': issue, 'expiration_date': expir}
                        )
                    except:
                        pass

        """
    
    new_content = content[:start_idx] + safe_block + content[end_idx:]
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully patched safely")
else:
    print("Markers not found!")
