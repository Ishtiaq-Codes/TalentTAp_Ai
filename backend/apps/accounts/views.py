"""Auth views — register, login, profile, password management."""
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import get_user_model

from .serializers import (
    RegisterSerializer, UserSerializer,
    ChangePasswordSerializer, ForgotPasswordSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Register a new user (candidate or company_admin)."""
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    """Obtain JWT access + refresh tokens."""
    permission_classes = [AllowAny]


class TokenRefresh(TokenRefreshView):
    """Refresh access token."""
    permission_classes = [AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    """Get or update current user profile."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """Change password for authenticated user."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'detail': 'Password updated.'})


class ForgotPasswordView(APIView):
    """Request a password reset email."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # In production: generate token, send email
        # For now, always return success (security: don't reveal if email exists)
        return Response({'detail': 'If an account exists, a reset link has been sent.'})


class AcceptInviteView(APIView):
    """Accept a company invitation and register."""
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        password = request.data.get('password')
        
        if not token or not password:
            return Response({'detail': 'Token and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        from apps.companies.models import CompanyInvitation, RecruiterProfile
        from django.utils import timezone
        
        try:
            invitation = CompanyInvitation.objects.get(id=token, status='pending')
        except CompanyInvitation.DoesNotExist:
            return Response({'detail': 'Invalid or expired invitation.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if invitation.expires_at < timezone.now():
            invitation.status = 'expired'
            invitation.save()
            return Response({'detail': 'Invitation has expired.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Check if user already exists
        if User.objects.filter(email=invitation.email).exists():
            return Response({'detail': 'User already exists. Please log in.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Create user
        user = User.objects.create_user(
            email=invitation.email,
            password=password,
            first_name=invitation.first_name,
            last_name=invitation.last_name,
            role='recruiter'
        )
        
        # Create profile
        RecruiterProfile.objects.create(
            user=user,
            company=invitation.company,
            title=invitation.title
        )
        
        # Mark as accepted
        invitation.status = 'accepted'
        invitation.save()
        
        # Generate tokens
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
