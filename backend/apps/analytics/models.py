import uuid
from django.db import models
from django.conf import settings

class RecruiterActionLog(models.Model):
    """
    Logs recruiter interactions with candidate profiles for use in the Intelligent Ranking System.
    """
    class ActionType(models.TextChoices):
        VIEW = 'view', 'Viewed Profile'
        SHORTLIST = 'shortlist', 'Shortlisted'
        REJECT = 'reject', 'Rejected'
        SAVE = 'save', 'Saved/Bookmarked'
        STATUS_CHANGE = 'status_change', 'Changed Application Status'
        JOB_CREATE = 'job_create', 'Created Job'
        JOB_DELETE = 'job_delete', 'Deleted Job'
        TALENT_POOL = 'talent_pool', 'Added to Talent Pool'
        SETTINGS_UPDATE = 'settings_update', 'Updated Settings'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recruiter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='action_logs'
    )
    candidate = models.ForeignKey(
        'candidates.CandidateProfile', on_delete=models.CASCADE, related_name='recruiter_actions', null=True, blank=True
    )
    job = models.ForeignKey(
        'jobs.Job', on_delete=models.SET_NULL, null=True, blank=True, related_name='recruiter_actions'
    )
    action_type = models.CharField(max_length=20, choices=ActionType.choices, db_index=True)
    details = models.JSONField(null=True, blank=True, help_text="Store additional context like status names or job titles")
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        candidate_email = self.candidate.user.email if self.candidate else 'System'
        return f"{self.recruiter.email} {self.action_type} {candidate_email}"
