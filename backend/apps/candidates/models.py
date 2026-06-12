"""Candidate profile, skills, and experience models."""
import uuid
from django.conf import settings
from django.db import models


class CandidateProfile(models.Model):
    """Candidate's professional profile."""

    class EmploymentStatus(models.TextChoices):
        EMPLOYED = 'employed', 'Employed'
        UNEMPLOYED = 'unemployed', 'Unemployed'
        FREELANCING = 'freelancing', 'Freelancing'
        STUDENT = 'student', 'Student'

    class Availability(models.TextChoices):
        IMMEDIATE = 'immediate', 'Immediate'
        TWO_WEEKS = '2_weeks', '2 Weeks'
        ONE_MONTH = '1_month', '1 Month'
        THREE_MONTHS = '3_months', '3 Months'
        NOT_AVAILABLE = 'not_available', 'Not Available'

    class EmploymentType(models.TextChoices):
        FULL_TIME = 'full_time', 'Full Time'
        PART_TIME = 'part_time', 'Part Time'
        CONTRACT = 'contract', 'Contract'
        FREELANCE = 'freelance', 'Freelance'
        INTERNSHIP = 'internship', 'Internship'

    class RemotePreference(models.TextChoices):
        REMOTE = 'remote', 'Remote Only'
        HYBRID = 'hybrid', 'Hybrid'
        ONSITE = 'onsite', 'On-site'
        ANY = 'any', 'Any'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='candidate_profile',
    )
    headline = models.CharField(max_length=200, blank=True)
    about = models.TextField(blank=True)
    country = models.CharField(max_length=100, blank=True, db_index=True)
    city = models.CharField(max_length=100, blank=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True)
    years_of_experience = models.IntegerField(default=0)
    employment_status = models.CharField(
        max_length=20, choices=EmploymentStatus.choices, default=EmploymentStatus.UNEMPLOYED, db_index=True,
    )
    availability = models.CharField(
        max_length=20, choices=Availability.choices, default=Availability.IMMEDIATE, db_index=True,
    )
    employment_type_preferred = models.CharField(
        max_length=20, choices=EmploymentType.choices, default=EmploymentType.FULL_TIME,
    )
    remote_preference = models.CharField(
        max_length=20, choices=RemotePreference.choices, default=RemotePreference.ANY,
    )
    career_goals = models.TextField(blank=True)
    salary_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_currency = models.CharField(max_length=3, default='USD')
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    banner_image = models.ImageField(upload_to='candidate_banners/', blank=True, null=True)
    is_open_to_work = models.BooleanField(default=True, db_index=True)
    profile_completion = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    @property
    def is_flight_risk(self):
        """
        AI Heuristic: Returns True if candidate is highly likely to move jobs.
        Trigger: Employed, 2+ years exp, and updated profile in the last 14 days.
        """
        from django.utils import timezone
        import datetime
        if self.employment_status == 'employed' and self.years_of_experience >= 2:
            fourteen_days_ago = timezone.now() - datetime.timedelta(days=14)
            if self.updated_at >= fourteen_days_ago:
                return True
        return False

    def __str__(self):
        return f'{self.user.full_name} — {self.headline}'

    def calculate_completion(self):
        """Calculate profile completion score (0–100)."""
        fields = {
            'headline': 10, 'about': 10, 'country': 5, 'city': 5,
            'years_of_experience': 10, 'employment_status': 5,
            'availability': 5, 'resume': 15,
        }
        score = sum(weight for field, weight in fields.items() if getattr(self, field))
        # Skills: 20 points (need at least 3)
        skill_count = self.skills.count()
        score += min(skill_count * 7, 20)
        # Experience: 10 points (need at least 1)
        if self.experiences.exists():
            score += 10
        # Education: 5 points (need at least 1)
        if self.education.exists():
            score += 5
        # Certifications: 5 points (optional, bonus if present, up to 100 max)
        if self.certifications.exists():
            score += 5
        return min(score, 100)

    def save(self, *args, **kwargs):
        # Only recalculate if this is an update (pk already exists)
        if self.pk:
            self.profile_completion = self.calculate_completion()
        super().save(*args, **kwargs)


class CandidateSkill(models.Model):
    """Skill attached to a candidate."""

    class Proficiency(models.TextChoices):
        BEGINNER = 'beginner', 'Beginner'
        INTERMEDIATE = 'intermediate', 'Intermediate'
        ADVANCED = 'advanced', 'Advanced'
        EXPERT = 'expert', 'Expert'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=100, db_index=True)
    proficiency = models.CharField(max_length=50, choices=Proficiency.choices, default=Proficiency.INTERMEDIATE)
    is_verified_by_ai = models.BooleanField(default=False)

    class Meta:
        unique_together = ['candidate', 'name']
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.proficiency})'


class Experience(models.Model):
    """Work experience entry."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='experiences')
    company_name = models.CharField(max_length=200)
    title = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f'{self.title} at {self.company_name}'

class Education(models.Model):
    """Educational background."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='education')
    institution_name = models.CharField(max_length=200)
    degree = models.CharField(max_length=200)
    field_of_study = models.CharField(max_length=200, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f'{self.degree} at {self.institution_name}'

class Certification(models.Model):
    """Professional certifications."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='certifications')
    name = models.CharField(max_length=200)
    issuing_organization = models.CharField(max_length=200)
    issue_date = models.DateField(null=True, blank=True)
    expiration_date = models.DateField(null=True, blank=True)
    credential_id = models.CharField(max_length=100, blank=True)
    credential_url = models.URLField(blank=True)

    class Meta:
        ordering = ['-issue_date']

    def __str__(self):
        return f'{self.name} by {self.issuing_organization}'
