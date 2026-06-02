"""Company & recruiter views."""
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCompanyAdmin, IsRecruiter
from .models import Company, RecruiterProfile, CompanyInvitation
from .serializers import CompanySerializer, RecruiterProfileSerializer, InviteRecruiterSerializer, CompanyInvitationSerializer
from . import services


class CompanyProfileView(generics.RetrieveUpdateAPIView):
    """Get or update the current user's company profile."""
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, IsCompanyAdmin]

    def get_object(self):
        company = Company.objects.filter(created_by=self.request.user).first()
        if not company:
            # Check if user is a recruiter
            profile = RecruiterProfile.objects.filter(user=self.request.user).first()
            if profile:
                return profile.company
        return company


class CompanyImagesUploadView(generics.UpdateAPIView):
    """Upload company logo or banner."""
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, IsCompanyAdmin]
    from rest_framework.parsers import MultiPartParser, FormParser
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        company = Company.objects.filter(created_by=self.request.user).first()
        if not company:
            from django.http import Http404
            raise Http404("Company not found.")
        return company

    def patch(self, request, *args, **kwargs):
        company = self.get_object()
        logo = request.FILES.get('logo')
        banner_image = request.FILES.get('banner_image')
        
        if not logo and not banner_image:
            return Response({'detail': 'No files provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if logo:
            company.logo = logo
        if banner_image:
            company.banner_image = banner_image
            
        company.save()
        return Response(CompanySerializer(company).data)


class CompanyCreateView(generics.CreateAPIView):
    """Create a company (company_admin only)."""
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, IsCompanyAdmin]

    def perform_create(self, serializer):
        company = serializer.save(created_by=self.request.user)
        # Ensure the admin has a RecruiterProfile so they can post jobs
        RecruiterProfile.objects.get_or_create(
            user=self.request.user,
            defaults={'company': company, 'title': 'Admin'}
        )


class RecruiterListView(generics.ListAPIView):
    """List recruiters in the current user's company."""
    serializer_class = RecruiterProfileSerializer
    permission_classes = [IsAuthenticated, IsCompanyAdmin]

    def get_queryset(self):
        company = Company.objects.filter(created_by=self.request.user).first()
        if not company:
            profile = RecruiterProfile.objects.filter(user=self.request.user).first()
            company = profile.company if profile else None
        if company:
            return RecruiterProfile.objects.filter(company=company).select_related('user')
        return RecruiterProfile.objects.none()


class InviteRecruiterView(APIView):
    """Invite a new recruiter to the company."""
    permission_classes = [IsAuthenticated, IsCompanyAdmin]

    def post(self, request):
        serializer = InviteRecruiterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        company = Company.objects.filter(created_by=request.user).first()
        if not company:
            return Response({'detail': 'Create a company first.'}, status=status.HTTP_400_BAD_REQUEST)
        invitation = services.invite_recruiter(
            company=company,
            email=serializer.validated_data['email'],
            first_name=serializer.validated_data['first_name'],
            last_name=serializer.validated_data['last_name'],
            title=serializer.validated_data.get('title', ''),
            invited_by=request.user,
        )
        return Response(CompanyInvitationSerializer(invitation).data, status=status.HTTP_201_CREATED)


class GetInvitationView(generics.RetrieveAPIView):
    """Get details of a pending invitation."""
    permission_classes = [AllowAny]
    serializer_class = CompanyInvitationSerializer
    queryset = CompanyInvitation.objects.filter(status='pending')
    lookup_field = 'id'

    def get_queryset(self):
        from django.utils import timezone
        return CompanyInvitation.objects.filter(status='pending', expires_at__gt=timezone.now())


class PendingInvitationsListView(generics.ListAPIView):
    """List pending invitations for the company."""
    permission_classes = [IsAuthenticated, IsCompanyAdmin]
    serializer_class = CompanyInvitationSerializer

    def get_queryset(self):
        company = Company.objects.filter(created_by=self.request.user).first()
        if company:
            return CompanyInvitation.objects.filter(company=company, status='pending')
        return CompanyInvitation.objects.none()


class RevokeInvitationView(generics.DestroyAPIView):
    """Revoke a pending invitation."""
    permission_classes = [IsAuthenticated, IsCompanyAdmin]
    lookup_field = 'id'

    def get_queryset(self):
        company = Company.objects.filter(created_by=self.request.user).first()
        if company:
            return CompanyInvitation.objects.filter(company=company)
        return CompanyInvitation.objects.none()


class RemoveRecruiterView(generics.DestroyAPIView):
    """Remove a recruiter from the company."""
    permission_classes = [IsAuthenticated, IsCompanyAdmin]
    queryset = RecruiterProfile.objects.all()

    def get_queryset(self):
        company = Company.objects.filter(created_by=self.request.user).first()
        if company:
            return RecruiterProfile.objects.filter(company=company)
        return RecruiterProfile.objects.none()
