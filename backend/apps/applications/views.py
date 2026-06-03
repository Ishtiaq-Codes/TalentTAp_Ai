"""Application & shortlist views."""
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCandidate, IsRecruiter
from apps.candidates.models import CandidateProfile
from apps.companies.models import RecruiterProfile
from .models import Application, Shortlist
from .serializers import ApplicationSerializer, ApplicationStatusSerializer, ShortlistSerializer


# ---------------------------------------------------------------------------
# Applications
# ---------------------------------------------------------------------------

class ApplicationCreateView(generics.CreateAPIView):
    """Candidate applies to a job."""
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def perform_create(self, serializer):
        profile = CandidateProfile.objects.get(user=self.request.user)
        serializer.save(candidate=profile)


class ApplicationListView(generics.ListAPIView):
    """List applications — candidates see theirs, recruiters see job applicants."""
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Application.objects.select_related(
            'job__company', 'candidate__user',
        )
        if user.role == 'candidate':
            return qs.filter(candidate__user=user)
        if user.role in ('recruiter', 'company_admin'):
            profile = RecruiterProfile.objects.filter(user=user).first()
            if profile:
                return qs.filter(job__company=profile.company)
        return qs  # admin


class ApplicationStatusUpdateView(APIView):
    """Recruiter updates application status."""
    permission_classes = [IsAuthenticated, IsRecruiter]

    def patch(self, request, pk):
        try:
            application = Application.objects.get(pk=pk)
        except Application.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ApplicationStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application.status = serializer.validated_data['status']
        application.save(update_fields=['status', 'updated_at'])
        return Response(ApplicationSerializer(application).data)


# ---------------------------------------------------------------------------
# Shortlists
# ---------------------------------------------------------------------------

class ShortlistListCreateView(generics.ListCreateAPIView):
    """List or create shortlist entries."""
    serializer_class = ShortlistSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        user = self.request.user
        profile = RecruiterProfile.objects.filter(user=user).first()
        if not profile and user.role == 'company_admin':
            company = getattr(user, 'owned_companies', None)
            if company and company.exists():
                profile = RecruiterProfile.objects.filter(company=company.first()).first()

        if profile:
            return Shortlist.objects.filter(recruiter=profile).select_related('candidate__user', 'job')
        return Shortlist.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        profile = RecruiterProfile.objects.filter(user=user).first()
        if not profile and user.role == 'company_admin':
            company = getattr(user, 'owned_companies', None)
            if company and company.exists():
                # For company admins without a recruiter profile, we can create one or fallback
                profile, _ = RecruiterProfile.objects.get_or_create(
                    user=user, 
                    company=company.first(),
                    defaults={'title': 'Company Admin'}
                )
        
        serializer.save(recruiter=profile)


class ShortlistDeleteView(generics.DestroyAPIView):
    """Remove candidate from shortlist."""
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        profile = RecruiterProfile.objects.filter(user=self.request.user).first()
        if profile:
            return Shortlist.objects.filter(recruiter=profile)
        return Shortlist.objects.none()


class ShortlistToggleView(APIView):
    """Toggle a candidate in the shortlist by candidate ID."""
    permission_classes = [IsAuthenticated, IsRecruiter]

    def post(self, request):
        user = request.user
        profile = RecruiterProfile.objects.filter(user=user).first()
        if not profile and user.role == 'company_admin':
            company = getattr(user, 'owned_companies', None)
            if company and company.exists():
                profile, _ = RecruiterProfile.objects.get_or_create(
                    user=user, company=company.first(), defaults={'title': 'Company Admin'}
                )
        if not profile:
            return Response({'detail': 'Recruiter profile required.'}, status=status.HTTP_403_FORBIDDEN)
            
        candidate_id = request.data.get('candidate')
        if not candidate_id:
            return Response({'detail': 'Candidate ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        job_id = request.data.get('job', None)
        
        # Check if exists (ignore job_id so we can unsave from anywhere)
        existing = Shortlist.objects.filter(recruiter=profile, candidate_id=candidate_id).first()
        if existing:
            # Delete all shortlists for this candidate by this recruiter to avoid duplicates
            Shortlist.objects.filter(recruiter=profile, candidate_id=candidate_id).delete()
            return Response({'status': 'removed', 'is_shortlisted': False})
        else:
            Shortlist.objects.create(recruiter=profile, candidate_id=candidate_id, job_id=job_id)
            return Response({'status': 'added', 'is_shortlisted': True})
