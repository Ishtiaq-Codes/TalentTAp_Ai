import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.accounts.models import User
from apps.candidates.models import CandidateProfile, CandidateSkill

def create_dummy():
    # 1. Create a dummy user
    user, created = User.objects.get_or_create(
        email='dummy_react_dev@example.com',
        defaults={
            'first_name': 'Alex',
            'last_name': 'Reactson',
            'role': 'candidate',
            'is_active': True
        }
    )
    if created:
        user.set_password('password123')
        user.save()

    # 2. Create candidate profile
    profile, p_created = CandidateProfile.objects.get_or_create(
        user=user,
        defaults={
            'headline': 'Senior Frontend Engineer',
            'about': 'I am a passionate Senior Frontend Developer with 5 years of experience building scalable web applications using React, Next.js, and Node.js. I love creating beautiful UIs.',
            'years_of_experience': 5,
            'is_open_to_work': True
        }
    )

    # 3. Add skills
    skills = ['React', 'JavaScript', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Node.js']
    for skill in skills:
        CandidateSkill.objects.get_or_create(
            candidate=profile,
            name=skill
        )

    print("✅ Dummy Candidate Created Successfully!")
    print(f"Email: {user.email}")
    print(f"Password: password123")
    print(f"Skills: {', '.join(skills)}")
    print("--------------------------------------------------")
    print("TESTING INSTRUCTIONS:")
    print("1. Log in to your Recruiter account on the frontend.")
    print("2. Go to 'Post a New Job'.")
    print("3. Title: 'Senior React Developer'")
    print("4. Add Skills: 'React', 'JavaScript', 'Next.js'")
    print("5. Make sure the 'Enable Auto-Headhunter 🦄' toggle is ON.")
    print("6. Click 'Publish Job'.")
    print("7. Look at this backend terminal... within 10-15 seconds, you will see the AI drafting and sending an email to Alex Reactson!")

if __name__ == '__main__':
    create_dummy()
