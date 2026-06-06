"""Matching views — run matching, view results."""
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsRecruiter, IsCandidate
from apps.candidates.models import CandidateProfile
from apps.jobs.models import Job
from .models import MatchScore
from .serializers import MatchScoreSerializer
from . import services


class RunMatchingView(APIView):
    """Run the AI matching engine for a specific job."""
    permission_classes = [IsAuthenticated, IsRecruiter]

    def post(self, request, job_id):
        try:
            job = Job.objects.prefetch_related('skills').get(pk=job_id)
        except Job.DoesNotExist:
            return Response({'detail': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)

        if job.status != 'active':
            return Response({'detail': 'Matching is only available for active jobs.'}, status=status.HTTP_400_BAD_REQUEST)

        results = services.run_matching_for_job(job)
        return Response({
            'job': str(job.title),
            'total_matches': len(results),
            'results': MatchScoreSerializer(results[:50], many=True).data,
        })


class JobMatchResultsView(generics.ListAPIView):
    """Get cached match results for a job."""
    serializer_class = MatchScoreSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]
    pagination_class = None

    def get_queryset(self):
        # Only return high-quality matches (score >= 60%) so the recruiter doesn't see irrelevant candidates
        return MatchScore.objects.filter(
            job_id=self.kwargs['job_id'],
            overall_score__gte=60
        ).select_related('candidate__user', 'job__company').order_by('-overall_score')


class CandidateMatchesView(generics.ListAPIView):
    """Get job matches for the current candidate."""
    serializer_class = MatchScoreSerializer
    permission_classes = [IsAuthenticated, IsCandidate]
    pagination_class = None

    def get_queryset(self):
        profile = CandidateProfile.objects.filter(user=self.request.user).first()
        if not profile:
            return MatchScore.objects.none()
            
        matches = MatchScore.objects.filter(candidate=profile)
        
        # Auto-run matching if they have 0 matches (e.g. newly created profile)
        if not matches.exists() and profile.is_open_to_work:
            from apps.matching import services
            services.run_matching_for_candidate(profile)
            matches = MatchScore.objects.filter(candidate=profile)
            
        # Only return high-quality matches (score >= 60%)
        return matches.filter(overall_score__gte=60).select_related('job__company', 'candidate__user').order_by('-overall_score')
