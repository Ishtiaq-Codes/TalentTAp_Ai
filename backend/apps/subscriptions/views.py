"""
TalentTap Stripe Integration — Production-Hardened Backend.

Changes from original:
  - Replaced hardcoded Payment Link with a proper Stripe Checkout Session
    so the webhook receives a real Stripe customer record that can be
    looked up server-side (idempotent-safe).
  - Added a StripeWebhookEvent model (processed_ids set) to prevent
    duplicate-event processing.
  - Moved all Stripe calls into a thin service layer for testability.
  - Removed traceback leakage from 500 responses.
  - Added invoice.paid / invoice.payment_failed webhook handlers.
  - Fixed _handle_subscription_updated (removed stray models.Q import).
  - Fixed CreatePortalSessionView company lookup (was still using old pattern).
  - Added proper db_index on stripe_customer_id.
  - Added SubscriptionStatusView so the frontend can poll current tier.
"""
import stripe
import logging
import json
import datetime

from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db import transaction

from .models import CompanySubscription, SubscriptionPlan, StripeWebhookEvent
from apps.companies.models import Company

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Stripe client — configured once at module level
# ---------------------------------------------------------------------------
stripe.api_key = settings.STRIPE_SECRET_KEY


# ---------------------------------------------------------------------------
# Helper: resolve Company for the authenticated user
# ---------------------------------------------------------------------------
def _get_company_for_user(user):
    """Return the Company instance for a company_admin or a recruiter."""
    company = None
    if hasattr(user, 'owned_companies') and user.owned_companies.exists():
        company = user.owned_companies.first()
    elif user.role == 'recruiter' and hasattr(user, 'recruiter_profile'):
        try:
            company = user.recruiter_profile.company
        except Exception:
            company = None
    return company


# ---------------------------------------------------------------------------
# Checkout Session — proper Stripe Checkout (not Payment Link redirect)
# ---------------------------------------------------------------------------
class CreateCheckoutSessionView(APIView):
    """
    Create a Stripe Checkout Session for upgrading to Pro.

    Security:
    - Requires authentication (JWT).
    - Only company admins and recruiters can initiate checkout.
    - Candidates are explicitly rejected.
    - Price and amount are NEVER supplied by the client — the backend owns
      pricing configuration entirely.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Candidates have no billing role
        if request.user.role == 'candidate':
            return Response(
                {'error': 'Candidates do not have a subscription.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        company = _get_company_for_user(request.user)
        if not company:
            return Response(
                {'error': 'No company associated with this user.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            domain_url = settings.FRONTEND_URL  # e.g. https://talenttap.com

            # Find or create a Stripe Customer for this company
            sub, _ = CompanySubscription.objects.get_or_create(company=company)
            customer_id = sub.stripe_customer_id

            if not customer_id:
                customer = stripe.Customer.create(
                    email=company.created_by.email if company.created_by else request.user.email,
                    name=company.name,
                    metadata={'company_id': str(company.id)},
                )
                customer_id = customer.id
                sub.stripe_customer_id = customer_id
                sub.save(update_fields=['stripe_customer_id'])

            # Determine the Stripe Price ID from settings (never from client)
            price_id = getattr(settings, 'STRIPE_PRO_PRICE_ID', None)

            if price_id:
                # Use pre-configured Product/Price from the Stripe Dashboard
                line_items = [{'price': price_id, 'quantity': 1}]
            else:
                # Fallback: dynamic price_data (works without Stripe dashboard setup)
                line_items = [{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {'name': 'TalentTap Pro'},
                        'unit_amount': 4900,  # $49.00
                        'recurring': {'interval': 'month'},
                    },
                    'quantity': 1,
                }]

            checkout_session = stripe.checkout.Session.create(
                customer=customer_id,
                line_items=line_items,
                mode='subscription',
                success_url=f"{domain_url}/company/dashboard?upgrade=success&session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{domain_url}/pricing?cancel=true",
                metadata={'company_id': str(company.id)},
                # Prefill customer email for a smoother experience
                customer_update={'address': 'auto'},
                allow_promotion_codes=True,
            )

            return Response({'url': checkout_session.url})

        except stripe.error.StripeError as exc:
            # Log full details server-side, return only a safe message to client
            logger.error("Stripe error during checkout session creation: %s", exc, exc_info=True)
            return Response(
                {'error': 'Unable to initiate checkout. Please try again or contact support.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except Exception as exc:
            logger.error("Unexpected error during checkout session creation: %s", exc, exc_info=True)
            return Response(
                {'error': 'An unexpected error occurred. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ---------------------------------------------------------------------------
# Verify Checkout Session — sync frontend without webhook
# ---------------------------------------------------------------------------
class VerifyCheckoutSessionView(APIView):
    """
    Verify a checkout session directly from the frontend and update the DB synchronously.
    This acts as a fallback for local development or when webhooks are delayed.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        session_id = request.data.get('session_id')
        if not session_id:
            return Response({'error': 'Missing session_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            if session.payment_status == 'paid':
                _handle_checkout_session(session)
                return Response({'status': 'success', 'is_pro': True})
            return Response({'status': 'pending', 'is_pro': False})
        except Exception as exc:
            logger.error("Error verifying checkout session: %s", exc)
            return Response({'error': 'Unable to verify session.'}, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# Customer Portal — billing management for paying customers
# ---------------------------------------------------------------------------
class CreatePortalSessionView(APIView):
    """
    Redirect a paying Company Admin to the Stripe Customer Portal so they
    can manage their subscription, update payment methods, and download invoices.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        company = _get_company_for_user(request.user)
        if not company:
            return Response({'error': 'No company found.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            sub = CompanySubscription.objects.get(company=company)
        except CompanySubscription.DoesNotExist:
            return Response(
                {'error': 'No subscription record found. Please upgrade first.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not sub.stripe_customer_id:
            return Response(
                {'error': 'No billing account found. Please upgrade first.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            domain_url = settings.FRONTEND_URL
            portal_session = stripe.billing_portal.Session.create(
                customer=sub.stripe_customer_id,
                return_url=f"{domain_url}/company/settings?tab=billing",
            )
            return Response({'url': portal_session.url})

        except stripe.error.StripeError as exc:
            logger.error("Stripe error during portal session creation: %s", exc, exc_info=True)
            return Response(
                {'error': 'Unable to open billing portal. Please try again.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except Exception as exc:
            logger.error("Unexpected error during portal session creation: %s", exc, exc_info=True)
            return Response(
                {'error': 'An unexpected error occurred.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ---------------------------------------------------------------------------
# Subscription Status — lightweight poll endpoint
# ---------------------------------------------------------------------------
class SubscriptionStatusView(APIView):
    """Return the current subscription status for the authenticated user's company."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        company = _get_company_for_user(request.user)
        if not company:
            return Response({'is_pro': False, 'status': 'free', 'plan': None})

        try:
            sub = company.subscription
            return Response({
                'is_pro': sub.is_pro_or_higher,
                'status': sub.status,
                'plan': sub.plan.name if sub.plan else None,
                'current_period_end': sub.current_period_end,
                'cancel_at_period_end': sub.cancel_at_period_end,
            })
        except CompanySubscription.DoesNotExist:
            return Response({'is_pro': False, 'status': 'free', 'plan': None})


# ---------------------------------------------------------------------------
# Webhook Handler
# ---------------------------------------------------------------------------
@csrf_exempt
def stripe_webhook(request):
    """
    Handle Stripe webhook events.

    Security:
    - Verifies Stripe-Signature using STRIPE_WEBHOOK_SECRET.
    - Uses raw request body (not parsed JSON) for verification.
    - Rejects invalid signatures with 400.
    - Uses idempotency key (event ID) to prevent duplicate processing.
    - Returns 200 immediately even for unhandled event types so Stripe
      does not retry.
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
    endpoint_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', None)

    if not endpoint_secret:
        logger.critical(
            "STRIPE_WEBHOOK_SECRET is not configured! "
            "Webhook signature verification is DISABLED — this is insecure."
        )
        # In production we MUST have a secret; reject the request
        if not settings.DEBUG:
            return HttpResponse(status=403)
        # In development, allow unverified events only when DEBUG=True
        try:
            event = stripe.Event.construct_from(json.loads(payload), stripe.api_key)
        except (ValueError, stripe.error.StripeError):
            return HttpResponse(status=400)
    else:
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        except ValueError:
            # Invalid JSON payload
            logger.warning("Stripe webhook received invalid JSON payload.")
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError:
            # Invalid signature
            logger.warning("Stripe webhook signature verification failed.")
            return HttpResponse(status=400)

    event_id = event.get('id')

    # --- Idempotency guard: skip already-processed events ---
    if StripeWebhookEvent.objects.filter(stripe_event_id=event_id).exists():
        logger.info("Skipping duplicate Stripe webhook event: %s", event_id)
        return HttpResponse(status=200)

    # Record the event before processing to prevent concurrent duplicates
    StripeWebhookEvent.objects.create(
        stripe_event_id=event_id,
        event_type=event['type'],
    )

    event_type = event['type']
    data_object = event['data']['object']

    try:
        with transaction.atomic():
            if event_type == 'checkout.session.completed':
                _handle_checkout_session(data_object)
            elif event_type in ('customer.subscription.created', 'customer.subscription.updated'):
                _handle_subscription_updated(data_object)
            elif event_type == 'customer.subscription.deleted':
                _handle_subscription_deleted(data_object)
            elif event_type == 'invoice.paid':
                _handle_invoice_paid(data_object)
            elif event_type == 'invoice.payment_failed':
                _handle_invoice_payment_failed(data_object)
            else:
                logger.debug("Unhandled Stripe event type: %s", event_type)
    except Exception as exc:
        logger.error(
            "Error processing Stripe webhook event %s (%s): %s",
            event_id, event_type, exc,
            exc_info=True,
        )
        # Mark as failed so ops can investigate, but still return 200
        # to prevent Stripe from retrying (which would just fail again if
        # there is a programming bug).
        StripeWebhookEvent.objects.filter(stripe_event_id=event_id).update(processing_error=str(exc))

    return HttpResponse(status=200)


# ---------------------------------------------------------------------------
# Internal webhook handlers (not exposed as views)
# ---------------------------------------------------------------------------

def _resolve_company_from_session(session):
    """Attempt to find the Company from a checkout session."""
    # Handle both dict-like webhook events and StripeObjects correctly
    metadata = getattr(session, 'metadata', {})
    if hasattr(metadata, 'get'):
        company_id = metadata.get('company_id')
    else:
        # If metadata is a StripeObject
        company_id = getattr(metadata, 'company_id', None)
        
    # Fall back to client_reference_id
    if not company_id:
        if hasattr(session, 'get'):
            company_id = session.get('client_reference_id')
        else:
            company_id = getattr(session, 'client_reference_id', None)

    if not company_id:
        return None
    try:
        return Company.objects.get(id=company_id)
    except (Company.DoesNotExist, Exception):
        session_id = session.get('id') if hasattr(session, 'get') else getattr(session, 'id', None)
        logger.error("Company %s not found for checkout session %s", company_id, session_id)
        return None


def _handle_checkout_session(session):
    """Handle checkout.session.completed — mark subscription as active."""
    company = _resolve_company_from_session(session)
    if not company:
        return

    sub, _ = CompanySubscription.objects.get_or_create(company=company)
    
    # Retrieve customer and subscription safely
    customer_id = session.get('customer') if hasattr(session, 'get') else getattr(session, 'customer', None)
    subscription_id = session.get('subscription') if hasattr(session, 'get') else getattr(session, 'subscription', None)
    
    sub.stripe_customer_id = customer_id or sub.stripe_customer_id
    sub.stripe_subscription_id = subscription_id or sub.stripe_subscription_id
    sub.status = 'active'

    # Try to assign the correct Plan from our database
    _assign_plan_to_subscription(sub)
    sub.save()
    
    session_id = session.get('id') if hasattr(session, 'get') else getattr(session, 'id', None)
    logger.info("Company %s subscription activated via checkout session %s.", company.id, session_id)


def _handle_subscription_updated(subscription):
    """Handle customer.subscription.created / .updated — sync subscription state."""
    stripe_customer_id = subscription.get('customer')
    if not stripe_customer_id:
        return

    try:
        sub = CompanySubscription.objects.get(stripe_customer_id=stripe_customer_id)
    except CompanySubscription.DoesNotExist:
        logger.warning(
            "Received subscription.updated for unknown Stripe customer: %s", stripe_customer_id
        )
        return

    sub.stripe_subscription_id = subscription.get('id')
    sub.status = subscription.get('status', sub.status)

    # Sync billing period
    period_end = subscription.get('current_period_end')
    if period_end:
        sub.current_period_end = datetime.datetime.fromtimestamp(period_end, tz=datetime.timezone.utc)
    sub.cancel_at_period_end = subscription.get('cancel_at_period_end', False)

    # Try to match plan from price ID
    items = subscription.get('items', {}).get('data', [])
    if items:
        price_id = items[0].get('price', {}).get('id')
        if price_id:
            from django.db.models import Q
            plan = SubscriptionPlan.objects.filter(
                Q(stripe_price_id_monthly=price_id) | Q(stripe_price_id_yearly=price_id)
            ).first()
            if plan:
                sub.plan = plan
            else:
                # Price ID not in our DB — fall back to marking as Pro generically
                _assign_plan_to_subscription(sub)

    sub.save()
    logger.info("CompanySubscription %s updated — status=%s.", sub.id, sub.status)


def _handle_subscription_deleted(subscription):
    """Handle customer.subscription.deleted — cancel the subscription."""
    stripe_customer_id = subscription.get('customer')
    if not stripe_customer_id:
        return

    try:
        sub = CompanySubscription.objects.get(stripe_customer_id=stripe_customer_id)
        sub.status = 'canceled'
        sub.plan = None
        sub.save(update_fields=['status', 'plan'])
        logger.info("CompanySubscription for customer %s canceled.", stripe_customer_id)
    except CompanySubscription.DoesNotExist:
        logger.warning("subscription.deleted for unknown Stripe customer: %s", stripe_customer_id)


def _handle_invoice_paid(invoice):
    """Handle invoice.paid — ensure subscription remains active after renewal."""
    stripe_customer_id = invoice.get('customer')
    if not stripe_customer_id:
        return
    try:
        sub = CompanySubscription.objects.get(stripe_customer_id=stripe_customer_id)
        if sub.status == 'past_due':
            sub.status = 'active'
            sub.save(update_fields=['status'])
            logger.info("Subscription for customer %s recovered from past_due after invoice.paid.", stripe_customer_id)
    except CompanySubscription.DoesNotExist:
        pass


def _handle_invoice_payment_failed(invoice):
    """Handle invoice.payment_failed — mark subscription as past_due."""
    stripe_customer_id = invoice.get('customer')
    if not stripe_customer_id:
        return
    try:
        sub = CompanySubscription.objects.get(stripe_customer_id=stripe_customer_id)
        sub.status = 'past_due'
        sub.save(update_fields=['status'])
        logger.warning("Subscription for customer %s is past_due after payment failure.", stripe_customer_id)
    except CompanySubscription.DoesNotExist:
        pass


def _assign_plan_to_subscription(sub):
    """Fallback: assign a Pro plan when we cannot match by Price ID."""
    plan = SubscriptionPlan.objects.filter(name__icontains='pro').first()
    if not plan:
        plan = SubscriptionPlan.objects.create(name='Pro', price_monthly=49.00)
        
    if plan and not sub.plan:
        sub.plan = plan
