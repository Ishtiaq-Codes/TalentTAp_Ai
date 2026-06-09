import django
import os
import json
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.core.llm import generate_json, HAS_GEMINI
print('HAS_GEMINI:', HAS_GEMINI)
print(generate_json('Respond with {"hello": "world"}'))

from apps.jobs.models import Job
from apps.candidates.models import CandidateProfile
from apps.matching.engine import compute_match

job = Job.objects.first()
cand = CandidateProfile.objects.first()

if job and cand:
    print('Testing compute_match:')
    result = compute_match(cand, job)
    print(json.dumps(result, indent=2))
else:
    print('No job or candidate found')
