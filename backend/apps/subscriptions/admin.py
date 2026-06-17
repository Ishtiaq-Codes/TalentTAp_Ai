from django.contrib import admin
from .models import SubscriptionPlan, CompanySubscription, StripeWebhookEvent


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'price_monthly', 'stripe_price_id_monthly', 'stripe_price_id_yearly', 'created_at')
    search_fields = ('name',)


@admin.register(CompanySubscription)
class CompanySubscriptionAdmin(admin.ModelAdmin):
    list_display = ('company', 'plan', 'status', 'is_pro_or_higher', 'created_at', 'current_period_end', 'stripe_customer_id')
    list_filter = ('status', 'plan')
    search_fields = ('company__name', 'stripe_customer_id', 'stripe_subscription_id')
    readonly_fields = ('stripe_customer_id', 'stripe_subscription_id', 'created_at', 'updated_at')

    @admin.display(boolean=True, description='Is Pro?')
    def is_pro_or_higher(self, obj):
        return obj.is_pro_or_higher


@admin.register(StripeWebhookEvent)
class StripeWebhookEventAdmin(admin.ModelAdmin):
    list_display = ('stripe_event_id', 'event_type', 'received_at', 'has_error')
    list_filter = ('event_type',)
    search_fields = ('stripe_event_id', 'event_type')
    readonly_fields = ('stripe_event_id', 'event_type', 'received_at', 'processing_error')

    @admin.display(boolean=True, description='Has Error?')
    def has_error(self, obj):
        return bool(obj.processing_error)
