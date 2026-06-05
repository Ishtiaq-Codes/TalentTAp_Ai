"""Company URL routes."""
from django.urls import path
from . import views

app_name = 'companies'

urlpatterns = [
    # Company profile
    path('profile/', views.CompanyProfileView.as_view(), name='profile'),
    path('profile/images/', views.CompanyImagesUploadView.as_view(), name='images-upload'),
    path('public/<uuid:pk>/', views.PublicCompanyDetailView.as_view(), name='public-detail'),
    path('create/', views.CompanyCreateView.as_view(), name='create'),

    # Dashboard analytics (NEW)
    path('dashboard/', views.CompanyDashboardView.as_view(), name='dashboard'),

    # Recruiter management
    path('recruiters/', views.RecruiterListView.as_view(), name='recruiter-list'),
    path('recruiters/me/', views.MyRecruiterProfileView.as_view(), name='recruiter-me'),
    path('recruiters/invite/', views.InviteRecruiterView.as_view(), name='recruiter-invite'),
    path('recruiters/invite/pending/', views.PendingInvitationsListView.as_view(), name='recruiter-invite-pending'),
    path('recruiters/invite/<uuid:id>/', views.GetInvitationView.as_view(), name='recruiter-invite-detail'),
    path('recruiters/invite/<uuid:id>/revoke/', views.RevokeInvitationView.as_view(), name='recruiter-invite-revoke'),
    path('recruiters/<uuid:pk>/', views.RemoveRecruiterView.as_view(), name='recruiter-remove'),
    path('recruiters/<uuid:pk>/status/', views.RecruiterStatusView.as_view(), name='recruiter-status'),  # NEW

    # Talent Pools (NEW)
    path('pools/', views.TalentPoolListCreateView.as_view(), name='pool-list'),
    path('pools/<uuid:pk>/', views.TalentPoolDetailView.as_view(), name='pool-detail'),
    path('pools/<uuid:pk>/members/', views.TalentPoolMembersView.as_view(), name='pool-members'),
    path('pools/<uuid:pk>/members/<uuid:candidate_pk>/', views.TalentPoolMemberRemoveView.as_view(), name='pool-member-remove'),
]
