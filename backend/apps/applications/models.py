"""Application and Shortlist models."""
import uuid
from django.db import models
from apps.candidates.models import CandidateProfile
from apps.companies.models import RecruiterProfile
from apps.jobs.models import Job


class Application(models.Model):
    """Job application submitted by a candidate."""

    class Status(models.TextChoices):
        APPLIED = 'applied', 'Applied'
        REVIEWING = 'reviewing', 'Reviewing'
        SHORTLISTED = 'shortlisted', 'Shortlisted'
        INTERVIEW = 'interview', 'Interview'
        OFFERED = 'offered', 'Offered'
        REJECTED = 'rejected', 'Rejected'
        WITHDRAWN = 'withdrawn', 'Withdrawn'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.APPLIED, db_index=True)
    cover_letter = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['job', 'candidate']
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.candidate.user.full_name} → {self.job.title}'


class Shortlist(models.Model):
    """Recruiter-saved candidate bookmark."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recruiter = models.ForeignKey(RecruiterProfile, on_delete=models.CASCADE, related_name='shortlists')
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='shortlisted_by')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='shortlists', null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['recruiter', 'candidate', 'job']
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.recruiter.user.full_name} ★ {self.candidate.user.full_name}'
