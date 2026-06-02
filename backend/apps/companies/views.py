"""Company & recruiter views."""
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCompanyAdmin, IsRecruiter
from .models import Company, RecruiterProfile
from .serializers import CompanySerializer, RecruiterProfileSerializer, InviteRecruiterSerializer
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


class CompanyCreateView(generics.CreateAPIView):
    """Create a company (company_admin only)."""
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, IsCompanyAdmin]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


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
        profile = services.invite_recruiter(
            company=company,
            email=serializer.validated_data['email'],
            first_name=serializer.validated_data['first_name'],
            last_name=serializer.validated_data['last_name'],
            title=serializer.validated_data.get('title', ''),
        )
        return Response(RecruiterProfileSerializer(profile).data, status=status.HTTP_201_CREATED)


class RemoveRecruiterView(generics.DestroyAPIView):
    """Remove a recruiter from the company."""
    permission_classes = [IsAuthenticated, IsCompanyAdmin]
    queryset = RecruiterProfile.objects.all()

    def get_queryset(self):
        company = Company.objects.filter(created_by=self.request.user).first()
        if company:
            return RecruiterProfile.objects.filter(company=company)
        return RecruiterProfile.objects.none()
