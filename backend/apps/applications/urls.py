"""Application URL routes."""
from django.urls import path
from . import views

app_name = 'applications'

urlpatterns = [
    path('', views.ApplicationListView.as_view(), name='list'),
    path('apply/', views.ApplicationCreateView.as_view(), name='apply'),
    path('<uuid:pk>/status/', views.ApplicationStatusUpdateView.as_view(), name='status-update'),
    path('shortlists/', views.ShortlistListCreateView.as_view(), name='shortlist-list-create'),
    path('shortlists/toggle/', views.ShortlistToggleView.as_view(), name='shortlist-toggle'),
    path('shortlists/<uuid:pk>/', views.ShortlistDeleteView.as_view(), name='shortlist-delete'),
]
