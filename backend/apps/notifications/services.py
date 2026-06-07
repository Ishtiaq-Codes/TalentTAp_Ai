"""Notification helper to create notifications from anywhere."""
from .models import Notification


def notify(user, notification_type, title, message, action_url='', sender=None):
    """Create a notification for a user."""
    # Check user preferences before creating notification
    if notification_type == Notification.Type.APPLICATION and not getattr(user, 'notify_new_apps', True):
        return None
    if notification_type == Notification.Type.MATCH and not getattr(user, 'notify_ai_match', True):
        return None
    if notification_type == Notification.Type.MESSAGE and not getattr(user, 'notify_messages', True):
        return None

    notification = Notification.objects.create(
        user=user,
        type=notification_type,
        title=title,
        message=message,
        action_url=action_url,
    )

    return notification
