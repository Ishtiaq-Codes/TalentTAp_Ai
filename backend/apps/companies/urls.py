"""Company URL routes."""
from django.urls import path
from . import views

app_name = 'companies'

urlpatterns = [
    path('profile/', views.CompanyProfileView.as_view(), name='profile'),
    path('create/', views.CompanyCreateView.as_view(), name='create'),
    path('recruiters/', views.RecruiterListView.as_view(), name='recruiter-list'),
    path('recruiters/invite/', views.InviteRecruiterView.as_view(), name='recruiter-invite'),
    path('recruiters/invite/pending/', views.PendingInvitationsListView.as_view(), name='recruiter-invite-pending'),
    path('recruiters/invite/<uuid:id>/', views.GetInvitationView.as_view(), name='recruiter-invite-detail'),
    path('recruiters/invite/<uuid:id>/revoke/', views.RevokeInvitationView.as_view(), name='recruiter-invite-revoke'),
    path('recruiters/<uuid:pk>/', views.RemoveRecruiterView.as_view(), name='recruiter-remove'),
]
