import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.dev")
django.setup()

from apps.candidates.models import CandidateProfile
from apps.interviews.models import AIInterviewSession
from apps.interviews.services import generate_interview_questions

candidate = CandidateProfile.objects.first()
if candidate:
    session = AIInterviewSession.objects.create(candidate=candidate)
    print("Testing generate_interview_questions...")
    success = generate_interview_questions(session)
    print(f"Success: {success}")
    if success:
        print(f"Questions: {session.questions.count()}")
    else:
        print("Failed!")
else:
    print("No candidate found to test with.")
