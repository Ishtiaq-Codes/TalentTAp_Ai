"""Stripe-related database models."""
from django.db import models
import uuid
from apps.companies.models import Company


class SubscriptionPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)  # e.g. 'Pro', 'Enterprise'
    stripe_price_id_monthly = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    stripe_price_id_yearly = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    features = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class CompanySubscription(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('past_due', 'Past Due'),
        ('canceled', 'Canceled'),
        ('unpaid', 'Unpaid'),
        ('trialing', 'Trialing'),
        ('incomplete', 'Incomplete'),
        ('incomplete_expired', 'Incomplete Expired'),
        ('paused', 'Paused'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.OneToOneField(Company, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subscriptions',
    )

    # Stripe identifiers — indexed for fast webhook lookups
    stripe_customer_id = models.CharField(max_length=255, blank=True, null=True, unique=True, db_index=True)
    stripe_subscription_id = models.CharField(max_length=255, blank=True, null=True, unique=True, db_index=True)

    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='active')

    current_period_end = models.DateTimeField(null=True, blank=True)
    cancel_at_period_end = models.BooleanField(default=False)

    # Trial tracking
    trial_end = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Company Subscription'
        verbose_name_plural = 'Company Subscriptions'

    def __str__(self):
        return f"{self.company.name} — {self.plan.name if self.plan else 'Free'} ({self.status})"

    @property
    def is_pro_or_higher(self):
        if not self.plan:
            return False
        if self.status not in ('active', 'trialing'):
            return False
        return self.plan.name.lower() in ('pro', 'enterprise')


class StripeWebhookEvent(models.Model):
    """
    Idempotency guard for Stripe webhook events.

    Before processing any event, we insert a row here.
    If the row already exists, we skip processing.
    This prevents duplicate actions when Stripe re-delivers an event.
    """
    stripe_event_id = models.CharField(max_length=255, unique=True, db_index=True)
    event_type = models.CharField(max_length=128)
    processing_error = models.TextField(blank=True, null=True)
    received_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Stripe Webhook Event'
        verbose_name_plural = 'Stripe Webhook Events'
        ordering = ['-received_at']

    def __str__(self):
        return f"{self.event_type} — {self.stripe_event_id}"
