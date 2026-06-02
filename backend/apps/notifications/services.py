"""Notification helper to create notifications from anywhere."""
from .models import Notification


def notify(user, notification_type, title, message, action_url=''):
    """Create a notification for a user."""
    return Notification.objects.create(
        user=user,
        type=notification_type,
        title=title,
        message=message,
        action_url=action_url,
    )
