"""Company business logic."""
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import RecruiterProfile, CompanyInvitation

User = get_user_model()


def invite_recruiter(company, email, first_name, last_name, title='', invited_by=None):
    """Create a company invitation and send an email."""
    expires_at = timezone.now() + timedelta(days=7)
    
    invitation, created = CompanyInvitation.objects.update_or_create(
        company=company,
        email=email,
        defaults={
            'first_name': first_name,
            'last_name': last_name,
            'title': title,
            'invited_by': invited_by,
            'expires_at': expires_at,
            'status': 'pending'
        }
    )
    
    # Generate the frontend URL
    # Assuming frontend runs on localhost:5173 for local dev, or from settings
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    invite_link = f"{frontend_url}/invite/{invitation.id}"
    
    subject = f"You have been invited to join {company.name}"
    message = (
        f"Hi {first_name},\n\n"
        f"You have been invited to join {company.name} as a Recruiter on TalentTap AI.\n"
        f"Click the link below to accept your invitation and set up your account:\n\n"
        f"{invite_link}\n\n"
        f"This link will expire in 7 days.\n\n"
        f"Thanks,\nThe TalentTap AI Team"
    )
    
    send_mail(
        subject,
        message,
        getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@talenttap.ai'),
        [email],
        fail_silently=False,
    )
    
    return invitation
