"""MatchScore model — stores AI matching results."""
import uuid
from django.db import models
from apps.candidates.models import CandidateProfile
from apps.jobs.models import Job


class MatchScore(models.Model):
    """Stores the computed match between a candidate and a job."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='matches')
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='matches')
    overall_score = models.DecimalField(max_digits=5, decimal_places=2, db_index=True)
    skills_score = models.DecimalField(max_digits=5, decimal_places=2)
    experience_score = models.DecimalField(max_digits=5, decimal_places=2)
    location_score = models.DecimalField(max_digits=5, decimal_places=2)
    availability_score = models.DecimalField(max_digits=5, decimal_places=2)
    employment_type_score = models.DecimalField(max_digits=5, decimal_places=2)
    breakdown = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['job', 'candidate']
        ordering = ['-overall_score']

    def __str__(self):
        return f'{self.candidate.user.full_name} ↔ {self.job.title}: {self.overall_score}%'
