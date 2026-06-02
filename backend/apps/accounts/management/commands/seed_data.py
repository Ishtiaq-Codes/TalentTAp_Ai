"""
Management command to seed the database with sample data for development.

Usage: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.companies.models import Company, RecruiterProfile
from apps.candidates.models import CandidateProfile, CandidateSkill, Experience
from apps.jobs.models import Job, JobSkill
from apps.applications.models import Application
from apps.matching.services import run_matching_for_job
from datetime import date

User = get_user_model()

SKILLS = [
    'Python', 'Django', 'React', 'JavaScript', 'TypeScript', 'Node.js',
    'PostgreSQL', 'Docker', 'AWS', 'GraphQL', 'REST API', 'Git',
    'Java', 'Spring Boot', 'Kubernetes', 'Redis', 'MongoDB', 'Flutter',
    'Swift', 'Figma', 'UI/UX', 'Machine Learning', 'TensorFlow', 'Go',
]


class Command(BaseCommand):
    help = 'Seed database with sample data for development'

    def handle(self, *args, **options):
        if User.objects.filter(email='admin@talenttap.ai').exists():
            self.stdout.write(self.style.WARNING('Data already seeded. Skipping.'))
            return

        self.stdout.write('Seeding database...')

        # --- Admin ---
        admin = User.objects.create_superuser(
            email='admin@talenttap.ai', password='admin123',
            first_name='Admin', last_name='User',
        )

        # --- Companies ---
        companies_data = [
            {'name': 'TechVault Inc', 'industry': 'Technology', 'company_size': '51-200',
             'country': 'United States', 'city': 'San Francisco', 'website': 'https://techvault.io'},
            {'name': 'DataFlow Labs', 'industry': 'Data Science', 'company_size': '11-50',
             'country': 'United Kingdom', 'city': 'London', 'website': 'https://dataflow.co'},
            {'name': 'CloudNine Solutions', 'industry': 'Cloud Computing', 'company_size': '201-500',
             'country': 'Germany', 'city': 'Berlin', 'website': 'https://cloudnine.dev'},
        ]

        companies = []
        recruiters = []
        for i, cd in enumerate(companies_data):
            # Create company admin
            ca_user = User.objects.create_user(
                email=f'company{i+1}@talenttap.ai', password='password123',
                first_name=f'Company{i+1}', last_name='Admin', role='company_admin',
            )
            company = Company.objects.create(created_by=ca_user, **cd)
            companies.append(company)

            # Create 2 recruiters per company
            for j in range(2):
                r_user = User.objects.create_user(
                    email=f'recruiter{i*2+j+1}@talenttap.ai', password='password123',
                    first_name=f'Recruiter{i*2+j+1}', last_name='Smith', role='recruiter',
                )
                rp = RecruiterProfile.objects.create(
                    user=r_user, company=company, title='Senior Recruiter',
                )
                recruiters.append(rp)

        # --- Candidates ---
        candidates_data = [
            {'first': 'Alice', 'last': 'Johnson', 'headline': 'Full-Stack Developer',
             'country': 'United States', 'city': 'San Francisco', 'years': 5,
             'skills': ['Python', 'Django', 'React', 'PostgreSQL', 'Docker'],
             'status': 'employed', 'availability': '2_weeks'},
            {'first': 'Bob', 'last': 'Williams', 'headline': 'Backend Engineer',
             'country': 'United Kingdom', 'city': 'London', 'years': 3,
             'skills': ['Python', 'Django', 'REST API', 'PostgreSQL', 'Redis'],
             'status': 'unemployed', 'availability': 'immediate'},
            {'first': 'Carol', 'last': 'Davis', 'headline': 'Frontend Developer',
             'country': 'Germany', 'city': 'Berlin', 'years': 4,
             'skills': ['React', 'JavaScript', 'TypeScript', 'Figma', 'UI/UX'],
             'status': 'freelancing', 'availability': '1_month'},
            {'first': 'David', 'last': 'Martinez', 'headline': 'DevOps Engineer',
             'country': 'United States', 'city': 'New York', 'years': 6,
             'skills': ['Docker', 'Kubernetes', 'AWS', 'Python', 'Go'],
             'status': 'employed', 'availability': '3_months'},
            {'first': 'Eva', 'last': 'Chen', 'headline': 'ML Engineer',
             'country': 'United States', 'city': 'San Francisco', 'years': 4,
             'skills': ['Python', 'TensorFlow', 'Machine Learning', 'Docker', 'PostgreSQL'],
             'status': 'unemployed', 'availability': 'immediate'},
            {'first': 'Frank', 'last': 'Brown', 'headline': 'Mobile Developer',
             'country': 'United Kingdom', 'city': 'Manchester', 'years': 2,
             'skills': ['Flutter', 'Swift', 'JavaScript', 'Firebase', 'Git'],
             'status': 'student', 'availability': '2_weeks'},
        ]

        candidate_profiles = []
        for cd in candidates_data:
            user = User.objects.create_user(
                email=f'{cd["first"].lower()}.{cd["last"].lower()}@email.com',
                password='password123',
                first_name=cd['first'], last_name=cd['last'], role='candidate',
            )
            profile = CandidateProfile.objects.create(
                user=user, headline=cd['headline'],
                country=cd['country'], city=cd['city'],
                years_of_experience=cd['years'],
                employment_status=cd['status'],
                availability=cd['availability'],
                about=f'Experienced {cd["headline"]} with {cd["years"]} years of experience.',
            )
            for skill in cd['skills']:
                CandidateSkill.objects.create(candidate=profile, name=skill, proficiency='advanced')
            Experience.objects.create(
                candidate=profile, company_name='Previous Corp',
                title=cd['headline'], start_date=date(2020, 1, 1),
                is_current=cd['status'] == 'employed',
                end_date=None if cd['status'] == 'employed' else date(2024, 6, 1),
                description=f'Worked as a {cd["headline"]}.',
            )
            profile.save()  # triggers profile_completion recalculation
            candidate_profiles.append(profile)

        # --- Jobs ---
        jobs_data = [
            {'title': 'Senior Python Developer', 'company': 0, 'recruiter': 0,
             'skills': [('Python', True), ('Django', True), ('PostgreSQL', True), ('Docker', False), ('REST API', False)],
             'exp_min': 3, 'exp_max': 7, 'remote': 'remote', 'type': 'full_time',
             'country': 'United States', 'city': 'San Francisco'},
            {'title': 'React Frontend Engineer', 'company': 0, 'recruiter': 1,
             'skills': [('React', True), ('JavaScript', True), ('TypeScript', False), ('UI/UX', False)],
             'exp_min': 2, 'exp_max': 5, 'remote': 'hybrid', 'type': 'full_time',
             'country': 'United States', 'city': 'San Francisco'},
            {'title': 'Data Engineer', 'company': 1, 'recruiter': 2,
             'skills': [('Python', True), ('PostgreSQL', True), ('AWS', True), ('Docker', False)],
             'exp_min': 2, 'exp_max': 6, 'remote': 'remote', 'type': 'full_time',
             'country': 'United Kingdom', 'city': 'London'},
            {'title': 'Junior Mobile Developer', 'company': 2, 'recruiter': 4,
             'skills': [('Flutter', True), ('Swift', False), ('JavaScript', True)],
             'exp_min': 0, 'exp_max': 2, 'remote': 'onsite', 'type': 'internship',
             'country': 'Germany', 'city': 'Berlin'},
        ]

        jobs = []
        for jd in jobs_data:
            job = Job.objects.create(
                title=jd['title'], company=companies[jd['company']],
                recruiter=recruiters[jd['recruiter']],
                description=f'We are looking for a {jd["title"]} to join our team.',
                experience_min=jd['exp_min'], experience_max=jd['exp_max'],
                employment_type=jd['type'], is_remote=jd['remote'],
                country=jd['country'], city=jd['city'],
                salary_min=50000, salary_max=120000,
                status='active',
            )
            for skill_name, required in jd['skills']:
                JobSkill.objects.create(job=job, name=skill_name, is_required=required)
            jobs.append(job)

        # --- Run matching ---
        for job in jobs:
            job.refresh_from_db()
            run_matching_for_job(job)

        # --- Sample applications ---
        Application.objects.create(job=jobs[0], candidate=candidate_profiles[0], cover_letter='I am very interested.')
        Application.objects.create(job=jobs[0], candidate=candidate_profiles[1])
        Application.objects.create(job=jobs[1], candidate=candidate_profiles[2], cover_letter='Frontend is my passion.')

        self.stdout.write(self.style.SUCCESS(
            f'Seeded: {User.objects.count()} users, {Company.objects.count()} companies, '
            f'{CandidateProfile.objects.count()} candidates, {Job.objects.count()} jobs'
        ))
