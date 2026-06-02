"""Company URL routes."""
from django.urls import path
from . import views

app_name = 'companies'

urlpatterns = [
    path('profile/', views.CompanyProfileView.as_view(), name='profile'),
    path('create/', views.CompanyCreateView.as_view(), name='create'),
    path('recruiters/', views.RecruiterListView.as_view(), name='recruiter-list'),
    path('recruiters/invite/', views.InviteRecruiterView.as_view(), name='recruiter-invite'),
    path('recruiters/<uuid:pk>/', views.RemoveRecruiterView.as_view(), name='recruiter-remove'),
]
