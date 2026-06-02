"""Notification model."""
import uuid
from django.conf import settings
from django.db import models


class Notification(models.Model):
    """In-app notification for a user."""

    class Type(models.TextChoices):
        MATCH = 'match', 'New Match'
        APPLICATION = 'application', 'Application Update'
        MESSAGE = 'message', 'New Message'
        JOB_STATUS = 'job_status', 'Job Status Change'
        SYSTEM = 'system', 'System'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=Type.choices)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False, db_index=True)
    action_url = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
        ]

    def __str__(self):
        return f'{self.title} → {self.user.email}'
