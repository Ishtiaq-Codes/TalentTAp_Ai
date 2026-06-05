"""Notification helper to create notifications from anywhere."""
from .models import Notification


def notify(user, notification_type, title, message, action_url='', is_rollup=False, sender=None):
    """Create a notification for a user.
    
    If the user is a recruiter and it's an important notification (Message, Match),
    roll it up to the Company Admin.
    """
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

    # Rollup to company admin for important notifications
    important_types = [Notification.Type.MESSAGE, Notification.Type.MATCH, Notification.Type.SYSTEM]
    
    if not is_rollup and user.role == 'recruiter' and notification_type in important_types:
        try:
            profile = getattr(user, 'recruiter_profile', None)
            if profile and profile.company:
                company_admin = profile.company.created_by
                if company_admin and company_admin.id != user.id:
                    if sender is None or company_admin.id != sender.id:
                        # Duplicate notification for admin
                        Notification.objects.create(
                            user=company_admin,
                            type=notification_type,
                            title=f"Team Update: {title}",
                            message=f"[{user.full_name}] {message}",
                            action_url=action_url,
                        )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to rollup notification to admin: {e}")

    return notification
