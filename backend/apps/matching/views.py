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

    def get_queryset(self):
        return MatchScore.objects.filter(
            job_id=self.kwargs['job_id'],
        ).select_related('candidate__user', 'job__company').order_by('-overall_score')


class CandidateMatchesView(generics.ListAPIView):
    """Get job matches for the current candidate."""
    serializer_class = MatchScoreSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_queryset(self):
        profile = CandidateProfile.objects.filter(user=self.request.user).first()
        if not profile:
            return MatchScore.objects.none()
        return MatchScore.objects.filter(
            candidate=profile,
        ).select_related('job__company', 'candidate__user').order_by('-overall_score')
