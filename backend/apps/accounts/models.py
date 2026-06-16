"""User model - email-based, role-aware."""
import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user with email login and role-based access."""

    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        COMPANY_ADMIN = 'company_admin', 'Company Admin'
        RECRUITER = 'recruiter', 'Recruiter'
        CANDIDATE = 'candidate', 'Candidate'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CANDIDATE)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    is_onboarded = models.BooleanField(default=False)

    # 2FA / MFA
    mfa_secret = models.CharField(max_length=32, blank=True, null=True)
    mfa_enabled = models.BooleanField(default=False)

    # Notification Preferences
    notify_new_apps = models.BooleanField(default=True)
    notify_ai_match = models.BooleanField(default=True)
    notify_messages = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'
