"""Matching URL routes."""
from django.urls import path
from . import views

app_name = 'matching'

urlpatterns = [
    path('jobs/<uuid:job_id>/run/', views.RunMatchingView.as_view(), name='run'),
    path('jobs/<uuid:job_id>/results/', views.JobMatchResultsView.as_view(), name='job-results'),
    path('candidates/me/', views.CandidateMatchesView.as_view(), name='candidate-matches'),
]
