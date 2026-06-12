import os
import uuid
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
User = get_user_model()
from apps.candidates.models import CandidateProfile, CandidateSkill
from apps.interviews.models import AIInterviewSession

def create_candidate(email, first_name, last_name, headline, passed, cheating):
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'first_name': first_name,
            'last_name': last_name,
            'role': 'candidate',
        }
    )
    if created:
        user.set_password('Test1234!')
        user.save()

    profile, _ = CandidateProfile.objects.get_or_create(
        user=user,
        defaults={
            'headline': headline,
            'about': f"I am a {headline.lower()} passionate about building great products.",
            'years_of_experience': 4,
            'country': 'Pakistan',
            'city': 'Lahore',
            'availability': 'immediate',
            'is_open_to_work': True,
            'profile_completion': 85
        }
    )

    # Add Skills
    skills = ['javascript', 'react.js', 'next.js', 'html', 'css']
    for s in skills:
        skill, _ = CandidateSkill.objects.get_or_create(candidate=profile, name=s)
        if passed and s in ['react.js', 'next.js']:
            skill.is_verified_by_ai = True
            skill.save()

    # Add AI Interview Session
    if passed:
        AIInterviewSession.objects.create(
            candidate=profile,
            status='completed',
            technical_score=95.0,
            soft_skills_score=90.0,
            overall_score=94.0,
            passed=True,
            ai_feedback_summary="Exceptional performance in React.js and Next.js architecture.",
            completed_at=timezone.now()
        )
        AIInterviewSession.objects.create(
            candidate=profile,
            status='completed',
            technical_score=92.0,
            soft_skills_score=88.0,
            overall_score=91.0,
            passed=True,
            ai_feedback_summary="Strong problem solving skills.",
            completed_at=timezone.now() - timedelta(days=2)
        )
    
    if cheating:
        AIInterviewSession.objects.create(
            candidate=profile,
            status='failed_cheating',
            technical_score=0.0,
            soft_skills_score=0.0,
            overall_score=0.0,
            passed=False,
            ai_feedback_summary="Cheating detected: Multiple tab switches and background voices identified.",
            completed_at=timezone.now(),
            cheat_flags=["tab_switch", "audio_anomaly"]
        )

    print(f"Created/Updated {first_name} {last_name} ({email}) - Passed: {passed}, Cheating: {cheating}")

create_candidate('alan.honest@example.com', 'Alan', 'Honest', 'Frontend Developer', passed=True, cheating=False)
create_candidate('charlie.cheater@example.com', 'Charlie', 'Cheater', 'Frontend Developer', passed=False, cheating=True)

print("\nDummy candidates created successfully.")
