import threading
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from apps.applications.models import Shortlist, Application
from .models import RecruiterActionLog

def log_action_async(recruiter_id, candidate_id, action_type, job_id=None, details=None):
    """Run the DB log creation in a separate thread so it doesn't block the API."""
    def _log():
        from django.db import connection
        try:
            RecruiterActionLog.objects.create(
                recruiter_id=recruiter_id,
                candidate_id=candidate_id,
                action_type=action_type,
                job_id=job_id,
                details=details
            )
        finally:
            connection.close()
            
    threading.Thread(target=_log).start()

@receiver(post_save, sender=Shortlist)
def track_shortlist_created(sender, instance, created, **kwargs):
    if created:
        log_action_async(
            recruiter_id=instance.recruiter.user.id,
            candidate_id=instance.candidate.id,
            action_type=RecruiterActionLog.ActionType.SHORTLIST,
            job_id=instance.job.id if instance.job else None
        )


