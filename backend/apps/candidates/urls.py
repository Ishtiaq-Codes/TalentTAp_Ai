"""Candidate URL routes."""
from django.urls import path
from . import views

app_name = 'candidates'

urlpatterns = [
    # Profile
    path('profile/', views.CandidateProfileView.as_view(), name='profile'),
    path('resume/', views.CandidateResumeUploadView.as_view(), name='resume-upload'),
    path('banner/', views.CandidateBannerUploadView.as_view(), name='banner-upload'),

    # Skills
    path('skills/', views.CandidateSkillListCreateView.as_view(), name='skill-list-create'),
    path('skills/<uuid:pk>/', views.CandidateSkillDeleteView.as_view(), name='skill-delete'),

    # Experience
    path('experience/', views.ExperienceListCreateView.as_view(), name='experience-list-create'),
    path('experience/<uuid:pk>/', views.ExperienceDetailView.as_view(), name='experience-detail'),

    # Education
    path('education/', views.EducationListCreateView.as_view(), name='education-list-create'),
    path('education/<uuid:pk>/', views.EducationDetailView.as_view(), name='education-detail'),

    # Certifications
    path('certifications/', views.CertificationListCreateView.as_view(), name='certification-list-create'),
    path('certifications/<uuid:pk>/', views.CertificationDetailView.as_view(), name='certification-detail'),

    # Search (recruiter)
    path('search/', views.CandidateSearchView.as_view(), name='search'),
    path('<uuid:pk>/', views.CandidatePublicProfileView.as_view(), name='public-profile'),
]
