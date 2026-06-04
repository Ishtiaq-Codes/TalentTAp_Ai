"""Auth views — register, login, profile, password management."""
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import get_user_model

from .serializers import (
    RegisterSerializer, UserSerializer,
    ChangePasswordSerializer, ForgotPasswordSerializer, ResetPasswordSerializer
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
    """Obtain JWT access + refresh tokens. Handles MFA if enabled."""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response({'detail': 'No active account found with the given credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            
        user = serializer.user
        if getattr(user, 'mfa_enabled', False):
            from django.core.signing import dumps
            mfa_token = dumps({'user_id': str(user.id)})
            return Response({
                'mfa_required': True,
                'mfa_token': mfa_token
            }, status=status.HTTP_200_OK)
            
        # Include user data in response (simplejwt doesn't do this by default unless customized, but our frontend expects it)
        response_data = serializer.validated_data
        response_data['user'] = UserSerializer(user).data
        return Response(response_data, status=status.HTTP_200_OK)


class LoginMFAView(APIView):
    """Complete login with MFA code."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        mfa_token = request.data.get('mfa_token')
        code = request.data.get('code')
        
        if not mfa_token or not code:
            return Response({'detail': 'MFA token and code required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        from django.core.signing import loads, SignatureExpired, BadSignature
        try:
            data = loads(mfa_token, max_age=300) # 5 mins
            user = User.objects.get(id=data['user_id'])
        except (SignatureExpired, BadSignature, User.DoesNotExist):
            return Response({'detail': 'Invalid or expired login session.'}, status=status.HTTP_400_BAD_REQUEST)
            
        import pyotp
        totp = pyotp.TOTP(user.mfa_secret)
        if totp.verify(code):
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        return Response({'detail': 'Invalid authenticator code.'}, status=status.HTTP_400_BAD_REQUEST)


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


class UserAvatarUploadView(APIView):
    """Upload user avatar."""
    permission_classes = [IsAuthenticated]
    from rest_framework.parsers import MultiPartParser, FormParser
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request, *args, **kwargs):
        avatar = request.FILES.get('avatar')
        if not avatar:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        user.avatar = avatar
        user.save()
        return Response(UserSerializer(user).data)


class ForgotPasswordView(APIView):
    """Request a password reset email."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        
        user = User.objects.filter(email=email).first()
        if user:
            from django.contrib.auth.tokens import default_token_generator
            from django.utils.http import urlsafe_base64_encode
            from django.utils.encoding import force_bytes
            from django.core.mail import send_mail
            from django.conf import settings
            
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            
            # Construct reset URL
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
            reset_url = f"{frontend_url}/reset-password?uid={uid}&token={token}"
            
            send_mail(
                subject='Password Reset - TalentTap AI',
                message=f'You requested a password reset. Click the link below to reset your password:\n\n{reset_url}\n\nIf you did not request this, please ignore this email.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
            
        return Response({'detail': 'If an account exists, a reset link has been sent.'})


class ResetPasswordView(APIView):
    """Reset password using token."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_decode
        
        uidb64 = serializer.validated_data['uidb64']
        token = serializer.validated_data['token']
        password = serializer.validated_data['password']
        
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
            
        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(password)
            user.save()
            return Response({'detail': 'Password has been reset successfully.'})
        else:
            return Response({'detail': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)


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


class SetupMFAView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        import pyotp
        user = request.user
        if user.mfa_enabled:
            return Response({'detail': 'MFA is already enabled.'}, status=status.HTTP_400_BAD_REQUEST)
            
        secret = pyotp.random_base32()
        user.mfa_secret = secret
        user.save()
        
        uri = pyotp.totp.TOTP(secret).provisioning_uri(name=user.email, issuer_name="TalentTap AI")
        return Response({'secret': secret, 'uri': uri})


class VerifyMFAView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        code = request.data.get('code')
        user = request.user
        
        if not user.mfa_secret:
            return Response({'detail': 'MFA setup not initiated.'}, status=status.HTTP_400_BAD_REQUEST)
            
        import pyotp
        totp = pyotp.TOTP(user.mfa_secret)
        if totp.verify(code):
            user.mfa_enabled = True
            user.save()
            return Response({'detail': 'MFA enabled successfully.'})
        return Response({'detail': 'Invalid code.'}, status=status.HTTP_400_BAD_REQUEST)


class DisableMFAView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        user.mfa_enabled = False
        user.mfa_secret = None
        user.save()
        return Response({'detail': 'MFA disabled.'})
