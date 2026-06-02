"""Candidate views — profile, skills, experience, search."""
from rest_framework import generics, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend

from apps.accounts.permissions import IsCandidate, IsRecruiter
from .models import CandidateProfile, CandidateSkill, Experience
from .serializers import (
    CandidateProfileSerializer, CandidateSearchSerializer,
    CandidateSkillSerializer, ExperienceSerializer,
)


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------

class CandidateProfileView(generics.RetrieveUpdateAPIView):
    """Get or update the current candidate's profile."""
    serializer_class = CandidateProfileSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_object(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return profile


class CandidateResumeUploadView(generics.UpdateAPIView):
    """Upload resume PDF."""
    serializer_class = CandidateProfileSerializer
    permission_classes = [IsAuthenticated, IsCandidate]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return profile

    def patch(self, request, *args, **kwargs):
        profile = self.get_object()
        resume = request.FILES.get('resume')
        if not resume:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        if not resume.name.endswith('.pdf'):
            return Response({'detail': 'Only PDF files are allowed.'}, status=status.HTTP_400_BAD_REQUEST)
        profile.resume = resume
        profile.save()
        return Response(CandidateProfileSerializer(profile).data)


# ---------------------------------------------------------------------------
# Skills
# ---------------------------------------------------------------------------

class CandidateSkillListCreateView(generics.ListCreateAPIView):
    serializer_class = CandidateSkillSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_queryset(self):
        profile = CandidateProfile.objects.filter(user=self.request.user).first()
        return CandidateSkill.objects.filter(candidate=profile) if profile else CandidateSkill.objects.none()

    def perform_create(self, serializer):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        serializer.save(candidate=profile)


class CandidateSkillDeleteView(generics.DestroyAPIView):
    serializer_class = CandidateSkillSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_queryset(self):
        profile = CandidateProfile.objects.filter(user=self.request.user).first()
        return CandidateSkill.objects.filter(candidate=profile) if profile else CandidateSkill.objects.none()


# ---------------------------------------------------------------------------
# Experience
# ---------------------------------------------------------------------------

class ExperienceListCreateView(generics.ListCreateAPIView):
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_queryset(self):
        profile = CandidateProfile.objects.filter(user=self.request.user).first()
        return Experience.objects.filter(candidate=profile) if profile else Experience.objects.none()

    def perform_create(self, serializer):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        serializer.save(candidate=profile)


class ExperienceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_queryset(self):
        profile = CandidateProfile.objects.filter(user=self.request.user).first()
        return Experience.objects.filter(candidate=profile) if profile else Experience.objects.none()


# ---------------------------------------------------------------------------
# Candidate Search (for recruiters)
# ---------------------------------------------------------------------------

class CandidateSearchView(generics.ListAPIView):
    """Search candidates — accessible to recruiters."""
    serializer_class = CandidateSearchSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['country', 'city', 'employment_status', 'availability', 'is_open_to_work']
    search_fields = ['headline', 'skills__name', 'user__first_name', 'user__last_name']
    ordering_fields = ['years_of_experience', 'updated_at']

    def get_queryset(self):
        return CandidateProfile.objects.filter(
            is_open_to_work=True,
        ).select_related('user').prefetch_related('skills')


class CandidatePublicProfileView(generics.RetrieveAPIView):
    """View a candidate's profile (recruiter view)."""
    serializer_class = CandidateProfileSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]
    queryset = CandidateProfile.objects.select_related('user').prefetch_related('skills', 'experiences')
