"""Analytics URL routes (admin only)."""
from django.urls import path
from . import views

# These are included under /api/v1/admin/ - but we need to update core/urls.py
# For now, we register them in the analytics app

app_name = 'analytics'

urlpatterns = [
    path('overview/', views.OverviewView.as_view(), name='overview'),
    path('companies/', views.AdminCompanyListView.as_view(), name='companies'),
    path('candidates/', views.AdminCandidateListView.as_view(), name='candidates'),
    path('jobs/', views.AdminJobListView.as_view(), name='jobs'),
]
