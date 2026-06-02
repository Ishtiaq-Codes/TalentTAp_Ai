"""Job and JobSkill models."""
import uuid
from django.db import models
from django.utils.text import slugify
from apps.companies.models import Company, RecruiterProfile


class Job(models.Model):
    """Job posting created by a recruiter."""

    class EmploymentType(models.TextChoices):
        FULL_TIME = 'full_time', 'Full Time'
        PART_TIME = 'part_time', 'Part Time'
        CONTRACT = 'contract', 'Contract'
        FREELANCE = 'freelance', 'Freelance'
        INTERNSHIP = 'internship', 'Internship'

    class RemoteStatus(models.TextChoices):
        REMOTE = 'remote', 'Remote'
        ONSITE = 'onsite', 'On-site'
        HYBRID = 'hybrid', 'Hybrid'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        ACTIVE = 'active', 'Active'
        PAUSED = 'paused', 'Paused'
        CLOSED = 'closed', 'Closed'
        ARCHIVED = 'archived', 'Archived'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='jobs')
    recruiter = models.ForeignKey(RecruiterProfile, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=250)
    description = models.TextField()
    experience_min = models.IntegerField(default=0)
    experience_max = models.IntegerField(default=1)
    employment_type = models.CharField(max_length=20, choices=EmploymentType.choices, default=EmploymentType.FULL_TIME)
    location = models.CharField(max_length=200, blank=True)
    country = models.CharField(max_length=100, blank=True, db_index=True)
    city = models.CharField(max_length=100, blank=True, db_index=True)
    is_remote = models.CharField(max_length=10, choices=RemoteStatus.choices, default=RemoteStatus.ONSITE)
    salary_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT, db_index=True)
    application_deadline = models.DateField(null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} — {self.company.name}'

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Job.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


class JobSkill(models.Model):
    """Skill required for a job."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=100, db_index=True)
    is_required = models.BooleanField(default=True)

    class Meta:
        unique_together = ['job', 'name']
        ordering = ['-is_required', 'name']

    def __str__(self):
        return f'{self.name} ({"Required" if self.is_required else "Nice-to-have"})'
