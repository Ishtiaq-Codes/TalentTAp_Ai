"""Auth URL routes."""
from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('login/mfa/', views.LoginMFAView.as_view(), name='login-mfa'),
    path('token/refresh/', views.TokenRefresh.as_view(), name='token_refresh'),
    
    # Profile & settings
    path('me/', views.MeView.as_view(), name='me'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('avatar/', views.UserAvatarUploadView.as_view(), name='avatar-upload'),
    
    # Password Reset
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', views.ResetPasswordView.as_view(), name='reset-password'),
    
    # MFA
    path('mfa/setup/', views.SetupMFAView.as_view(), name='mfa-setup'),
    path('mfa/verify/', views.VerifyMFAView.as_view(), name='mfa-verify'),
    path('mfa/disable/', views.DisableMFAView.as_view(), name='mfa-disable'),
    
    # Invitations
    path('accept-invite/', views.AcceptInviteView.as_view(), name='accept-invite'),
]
