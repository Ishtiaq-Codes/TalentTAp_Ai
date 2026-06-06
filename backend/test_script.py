from apps.candidates.models import CandidateProfile
import json

profiles = CandidateProfile.objects.exclude(about='')
for p in profiles:
    print(f'{p.id}: {p.about[:20]}... Resume={p.resume}')
    print(f'Skills: {p.skills.count()}')
    print(f'Experiences: {p.experiences.count()}')
    print(f'Education: {p.education.count()}')
    print(f'Certifications: {p.certifications.count()}')
