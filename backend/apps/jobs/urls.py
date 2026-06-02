"""Job URL routes."""
from django.urls import path
from . import views

app_name = 'jobs'

urlpatterns = [
    path('', views.JobListCreateView.as_view(), name='list-create'),
    path('public/', views.PublicJobListView.as_view(), name='public-list'),
    path('<uuid:pk>/', views.JobDetailView.as_view(), name='detail'),
    path('<uuid:pk>/status/', views.JobStatusView.as_view(), name='status'),
]
