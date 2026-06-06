"""Job views."""
from rest_framework import generics, status, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from apps.accounts.permissions import IsRecruiter, IsCandidate
from apps.companies.models import RecruiterProfile
from .models import Job
from .serializers import JobSerializer, JobListSerializer


from django.db.models import Count

class JobListCreateView(generics.ListCreateAPIView):
    """List or create jobs."""
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'employment_type', 'is_remote', 'country', 'city']
    search_fields = ['title', 'description', 'skills__name']
    ordering_fields = ['created_at', 'salary_min']

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return JobListSerializer
        return JobSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsRecruiter()]

    def get_queryset(self):
        user = self.request.user
        qs = Job.objects.select_related('company', 'recruiter__user').prefetch_related('skills').annotate(applicants_count=Count('applications'))

        # Candidates see only active jobs
        if user.role == 'candidate':
            return qs.filter(status='active')

        # Recruiters see their company's jobs
        if user.role in ('recruiter', 'company_admin'):
            profile = RecruiterProfile.objects.filter(user=user).first()
            if profile:
                return qs.filter(company=profile.company)
            # company_admin may own the company directly
            return qs.filter(company__created_by=user)

        # Admin sees all
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        profile = RecruiterProfile.objects.filter(user=user).first()
        if profile:
            job = serializer.save(company=profile.company, recruiter=profile)
            
            # Notify company admin
            company_admin = profile.company.created_by
            if company_admin and company_admin != user:
                from apps.notifications.services import notify
                from apps.notifications.models import Notification
                notify(
                    user=company_admin,
                    notification_type=Notification.Type.SYSTEM,
                    title="Team Update: New Job Posted",
                    message=f"[{user.full_name}] posted a new job: {job.title}",
                    action_url=f"/recruiter/jobs/{job.id}",
                    is_rollup=True
                )
        else:
            from apps.companies.models import Company
            company = Company.objects.filter(created_by=user).first()
            if company:
                profile = RecruiterProfile.objects.create(user=user, company=company, title='Admin')
                serializer.save(company=company, recruiter=profile)
            else:
                serializer.save(recruiter=None)


class JobDetailView(generics.RetrieveUpdateAPIView):
    """Get or update a job."""
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Job.objects.select_related('company', 'recruiter__user').prefetch_related('skills').annotate(applicants_count=Count('applications'))


class JobStatusView(APIView):
    """Change job status (draft → active → paused → closed → archived)."""
    permission_classes = [IsAuthenticated, IsRecruiter]

    def patch(self, request, pk):
        try:
            job = Job.objects.annotate(applicants_count=Count('applications')).get(pk=pk)
        except Job.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status not in dict(Job.Status.choices):
            return Response({'detail': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)

        job.status = new_status
        job.save(update_fields=['status', 'updated_at'])
        return Response(JobSerializer(job).data)


class PublicJobListView(generics.ListAPIView):
    """Public job listing — no auth required."""
    serializer_class = JobListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['company', 'employment_type', 'is_remote', 'country', 'city']
    search_fields = ['title', 'skills__name', 'company__name']

    def get_queryset(self):
        return Job.objects.filter(status='active').select_related('company').prefetch_related('skills').annotate(applicants_count=Count('applications'))


class JobOptimizeView(APIView):
    """Analyze a draft job and provide AI suggestions."""
    permission_classes = [IsAuthenticated, IsRecruiter]
    
    def post(self, request, *args, **kwargs):
        title = request.data.get('title', '')
        description = request.data.get('description', '')
        skills = request.data.get('skills', [])
        
        from .services import analyze_job_description
        result = analyze_job_description(title, description, skills)
        
        return Response(result)
