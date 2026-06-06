import threading
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from apps.applications.models import Shortlist, Application
from .models import RecruiterActionLog

def log_action_async(recruiter_id, candidate_id, action_type, job_id=None):
    """Run the DB log creation in a separate thread so it doesn't block the API."""
    def _log():
        RecruiterActionLog.objects.create(
            recruiter_id=recruiter_id,
            candidate_id=candidate_id,
            action_type=action_type,
            job_id=job_id
        )
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

@receiver(post_save, sender=Application)
def track_application_status(sender, instance, **kwargs):
    # Only track if it's explicitly rejected by a recruiter.
    # Note: We assume the user triggering this is the recruiter, but signals don't have request.user.
    # For a perfect implementation, we should log the action in the view where request.user is known.
    # But for the learning loop, we mainly care that the candidate was rejected for a job.
    if instance.status == Application.Status.REJECTED:
        # Assuming the job's creator is the recruiter who rejected them (simplification)
        # It's better to get the job creator or company admin.
        recruiter_id = instance.job.company.users.first().id if instance.job.company.users.exists() else None
        if recruiter_id:
            log_action_async(
                recruiter_id=recruiter_id,
                candidate_id=instance.candidate.id,
                action_type=RecruiterActionLog.ActionType.REJECT,
                job_id=instance.job.id
            )
