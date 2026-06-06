import json
data = json.loads('''{
"phone": "+923327265506", 
"city": "Lahore", 
"experiences": [{"title": "Freelance", "company_name": "K.K.", "start_date": "", "end_date": "2026-12-31"}], 
"education": [{"degree": "BS CS", "institution_name": "UAF", "start_date": "", "end_date": ""}], 
"certifications": [{"name": "Azure AI", "issuing_organization": "Microsoft"}]
}''')
from apps.candidates.models import CandidateProfile, Experience, Education, Certification

p = CandidateProfile.objects.order_by('-created_at').first()

exp = data['experiences'][0]
sd = exp.get('start_date') if exp.get('start_date') else '2000-01-01'
Experience.objects.get_or_create(candidate=p, title='Freelance', company_name='K.K.', defaults={'start_date': sd, 'end_date': '2026-12-31'})
print('Exp OK')

edu = data['education'][0]
sd = edu.get('start_date') if edu.get('start_date') else '2000-01-01'
Education.objects.get_or_create(candidate=p, degree='BS CS', institution_name='UAF', defaults={'start_date': sd, 'end_date': None})
print('Edu OK')

cert = data['certifications'][0]
Certification.objects.get_or_create(candidate=p, name='Azure AI', issuing_organization='Microsoft', defaults={'issue_date': None, 'expiration_date': None})
print('Cert OK')
