import os
import json
from apps.candidates.models import CandidateProfile
import apps.core.llm as llm

p = CandidateProfile.objects.order_by('-created_at').first()
if not p or not p.resume:
    p = CandidateProfile.objects.exclude(resume='').order_by('-created_at').first()

print(f"Testing with profile ID: {p.id}, file: {p.resume.path}")

prompt = """
Parse this resume and extract the data into a JSON object with this EXACT schema:
{
    "phone": "string",
    "city": "string",
    "github_url": "string",
    "linkedin_url": "string",
    "experiences": [
        {
            "title": "string",
            "company_name": "string",
            "start_date": "YYYY-MM-DD",
            "end_date": "YYYY-MM-DD",
            "description": "string"
        }
    ],
    "education": [
        {
            "degree": "string",
            "institution_name": "string",
            "start_date": "YYYY-MM-DD",
            "end_date": "YYYY-MM-DD"
        }
    ],
    "certifications": [
        {
            "name": "string",
            "issuing_organization": "string"
        }
    ]
}
Return ONLY valid JSON.
"""

gemini_file = llm.client.files.upload(file=p.resume.path)
response = llm.client.models.generate_content(
    model='gemini-2.5-flash',
    contents=[gemini_file, prompt]
)

try:
    llm.client.files.delete(name=gemini_file.name)
except Exception:
    pass

text = response.text.strip()
print(text)
