from django.urls import path
from . import views

app_name = 'subscriptions'

urlpatterns = [
    path('checkout/', views.CreateCheckoutSessionView.as_view(), name='checkout'),
    path('verify/', views.VerifyCheckoutSessionView.as_view(), name='verify'),
    path('portal/', views.CreatePortalSessionView.as_view(), name='portal'),
    path('status/', views.SubscriptionStatusView.as_view(), name='status'),
    path('webhook/', views.stripe_webhook, name='webhook'),
]
