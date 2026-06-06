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

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recruiter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='action_logs'
    )
    candidate = models.ForeignKey(
        'candidates.CandidateProfile', on_delete=models.CASCADE, related_name='recruiter_actions'
    )
    job = models.ForeignKey(
        'jobs.Job', on_delete=models.SET_NULL, null=True, blank=True, related_name='recruiter_actions'
    )
    action_type = models.CharField(max_length=20, choices=ActionType.choices, db_index=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.recruiter.email} {self.action_type} {self.candidate.user.email}"
