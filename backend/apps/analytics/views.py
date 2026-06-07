"""Admin analytics views — platform overview stats."""
from django.utils import timezone
from django.db.models import Count, Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdmin
from apps.accounts.models import User
from apps.companies.models import Company
from apps.candidates.models import CandidateProfile
from apps.jobs.models import Job
from apps.applications.models import Application


class OverviewView(APIView):
    """Platform analytics overview for super admin."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timezone.timedelta(days=30)

        data = {
            'total_companies': Company.objects.count(),
            'total_candidates': CandidateProfile.objects.count(),
            'total_jobs': Job.objects.count(),
            'active_jobs': Job.objects.filter(status='active').count(),
            'total_applications': Application.objects.count(),
            'total_users': User.objects.count(),
            'recent': {
                'new_companies_30d': Company.objects.filter(created_at__gte=thirty_days_ago).count(),
                'new_candidates_30d': CandidateProfile.objects.filter(created_at__gte=thirty_days_ago).count(),
                'new_jobs_30d': Job.objects.filter(created_at__gte=thirty_days_ago).count(),
                'new_applications_30d': Application.objects.filter(created_at__gte=thirty_days_ago).count(),
            },
            'applications_by_status': dict(
                Application.objects.values_list('status').annotate(count=Count('id')).order_by('status')
            ),
            'jobs_by_status': dict(
                Job.objects.values_list('status').annotate(count=Count('id')).order_by('status')
            ),
        }
        return Response(data)


class AdminCompanyListView(APIView):
    """List all companies for admin."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        companies = Company.objects.annotate(
            recruiter_count=Count('recruiters'),
            job_count=Count('jobs'),
        ).values(
            'id', 'name', 'industry', 'company_size', 'is_verified',
            'recruiter_count', 'job_count', 'created_at',
        )
        return Response(list(companies))


class AdminCandidateListView(APIView):
    """List all candidates for admin."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        candidates = CandidateProfile.objects.select_related('user').values(
            'id', 'user__email', 'user__first_name', 'user__last_name',
            'headline', 'country', 'city', 'employment_status',
            'availability', 'profile_completion', 'created_at',
        )
        return Response(list(candidates))


class AdminJobListView(APIView):
    """List all jobs for admin."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        jobs = Job.objects.select_related('company').values(
            'id', 'title', 'company__name', 'status', 'employment_type',
            'is_remote', 'country', 'city', 'created_at',
        ).annotate(application_count=Count('applications'))
        return Response(list(jobs))

from rest_framework import generics
from apps.accounts.permissions import IsRecruiter
from .models import RecruiterActionLog
from .serializers import RecruiterActionLogSerializer

class RecruiterActivityListView(generics.ListAPIView):
    serializer_class = RecruiterActionLogSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]
    
    def get_queryset(self):
        return RecruiterActionLog.objects.filter(
            recruiter=self.request.user
        ).select_related('candidate__user', 'job').order_by('-timestamp')[:50]
