"""Company business logic."""
from django.contrib.auth import get_user_model
from .models import RecruiterProfile

User = get_user_model()


def invite_recruiter(company, email, first_name, last_name, title=''):
    """Create a recruiter user and link to company."""
    user = User.objects.create_user(
        email=email,
        password=User.objects.make_random_password(),
        first_name=first_name,
        last_name=last_name,
        role='recruiter',
    )
    profile = RecruiterProfile.objects.create(
        user=user, company=company, title=title,
    )
    # TODO: send invite email with password reset link
    return profile
