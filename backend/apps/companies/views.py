"""Company & recruiter views."""
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCompanyAdmin, IsRecruiter
from apps.applications.models import Application, Shortlist
from apps.messaging.models import Message
from .models import Company, RecruiterProfile, CompanyInvitation, TalentPool, TalentPoolMember
from .serializers import (
    CompanySerializer, RecruiterProfileSerializer, InviteRecruiterSerializer,
    CompanyInvitationSerializer, TalentPoolSerializer, TalentPoolWriteSerializer,
    TalentPoolMemberSerializer,
)
from . import services


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_company_for_user(user):
    """Return the Company for a company_admin or the company they belong to."""
    company = Company.objects.filter(created_by=user).first()
    if not company:
        profile = RecruiterProfile.objects.filter(user=user).first()
        company = profile.company if profile else None
    return company


# ---------------------------------------------------------------------------
# Existing views (unchanged)
# ---------------------------------------------------------------------------

class CompanyProfileView(generics.RetrieveUpdateAPIView):
    """Get or update the current user's company profile."""
    serializer_class = CompanySerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            return [IsAuthenticated(), IsCompanyAdmin()]
        return [IsAuthenticated(), IsRecruiter()]

    def get_object(self):
        company = _get_company_for_user(self.request.user)
        if not company and self.request.user.role == 'company_admin':
            company = Company.objects.create(name='New Company', created_by=self.request.user)
            # Ensure the admin gets a profile immediately
            from apps.companies.models import RecruiterProfile
            RecruiterProfile.objects.get_or_create(
                user=self.request.user,
                defaults={'company': company, 'title': 'Company Admin', 'is_active': True}
            )
        return company


class PublicCompanyDetailView(generics.RetrieveAPIView):
    """Publicly accessible view for a company profile."""
    serializer_class = CompanySerializer
    permission_classes = [AllowAny]
    queryset = Company.objects.all()


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
        RecruiterProfile.objects.get_or_create(
            user=self.request.user,
            defaults={'company': company, 'title': 'Admin'}
        )


class RecruiterListView(generics.ListAPIView):
    """List recruiters in the current user's company."""
    serializer_class = RecruiterProfileSerializer
    permission_classes = [IsAuthenticated, IsCompanyAdmin]

    def get_queryset(self):
        company = _get_company_for_user(self.request.user)
        if company:
            # Ensure the company admin themselves has a RecruiterProfile so they appear in the team list
            if self.request.user.role == 'company_admin':
                RecruiterProfile.objects.get_or_create(
                    user=self.request.user,
                    defaults={'company': company, 'title': 'Company Admin', 'is_active': True}
                )
            return RecruiterProfile.objects.filter(company=company).select_related('user').order_by('created_at')
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


class MyRecruiterProfileView(generics.RetrieveUpdateAPIView):
    """Get or update current user's recruiter profile details."""
    serializer_class = RecruiterProfileSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get_object(self):
        try:
            return self.request.user.recruiter_profile
        except RecruiterProfile.DoesNotExist:
            return None


class RemoveRecruiterView(generics.DestroyAPIView):
    """Remove a recruiter from the company."""
    permission_classes = [IsAuthenticated, IsCompanyAdmin]
    queryset = RecruiterProfile.objects.all()

    def get_queryset(self):
        company = Company.objects.filter(created_by=self.request.user).first()
        if company:
            return RecruiterProfile.objects.filter(company=company)
        return RecruiterProfile.objects.none()


# ---------------------------------------------------------------------------
# NEW: Company Admin Dashboard
# ---------------------------------------------------------------------------

class CompanyDashboardView(APIView):
    """Real-time hiring command center data for Company Admin."""
    permission_classes = [IsAuthenticated, IsCompanyAdmin]

    def get(self, request):
        company = _get_company_for_user(request.user)
        if not company:
            return Response({'detail': 'No company found.'}, status=status.HTTP_404_NOT_FOUND)

        recruiters = RecruiterProfile.objects.filter(company=company).select_related('user')
        jobs = company.jobs.all()
        job_ids = jobs.values_list('id', flat=True)

        # Core stats
        active_jobs = jobs.filter(status='active').count()
        total_applications = Application.objects.filter(job__in=job_ids).count()
        shortlisted = Shortlist.objects.filter(recruiter__company=company).count()
        messages_sent = Message.objects.filter(
            sender__in=recruiters.values_list('user', flat=True)
        ).count()

        # Pipeline funnel
        pipeline_qs = Application.objects.filter(job__in=job_ids).values('status').annotate(count=Count('id'))
        pipeline = {item['status']: item['count'] for item in pipeline_qs}

        # Recruiter performance - use annotations to avoid N+1
        from apps.applications.models import Shortlist as ShortlistModel
        from apps.analytics.models import RecruiterActionLog
        from apps.analytics.serializers import RecruiterActionLogSerializer

        recruiters_annotated = RecruiterProfile.objects.filter(company=company).select_related('user').annotate(
            jobs_cnt=Count('jobs', distinct=True),
            shortlists_cnt=Count('shortlists', distinct=True),
            messages_cnt=Count('user__sent_messages', distinct=True),
        )

        recruiter_data = []
        for r in recruiters_annotated:
            avatar_url = None
            if r.user.avatar:
                try:
                    avatar_url = request.build_absolute_uri(r.user.avatar.url)
                except Exception:
                    pass

            activities = RecruiterActionLog.objects.filter(recruiter=r.user).select_related('candidate__user', 'job').order_by('-timestamp')[:100]
            recent_activities = RecruiterActionLogSerializer(activities, many=True, context={'request': request}).data

            recruiter_data.append({
                'id': str(r.id),
                'name': r.user.full_name,
                'title': r.title or 'Recruiter',
                'avatar': avatar_url,
                'is_active': r.is_active,
                'jobs_count': r.jobs_cnt,
                'shortlists_count': r.shortlists_cnt,
                'messages_count': r.messages_cnt,
                'joined_at': r.created_at.isoformat(),
                'recent_activities': recent_activities,
            })

        # Recent active jobs with application counts
        recent_jobs = jobs.filter(status='active').annotate(
            applications_count=Count('applications')
        ).order_by('-created_at').values(
            'id', 'title', 'status', 'city', 'country', 'applications_count', 'created_at'
        )[:5]

        return Response({
            'company': {
                'name': company.name,
                'logo': request.build_absolute_uri(company.logo.url) if company.logo else None,
                'industry': company.industry,
                'is_verified': company.is_verified,
            },
            'stats': {
                'active_recruiters': recruiters.filter(is_active=True).count(),
                'total_recruiters': recruiters.count(),
                'total_jobs': jobs.count(),
                'active_jobs': active_jobs,
                'total_applications': total_applications,
                'shortlisted_candidates': shortlisted,
                'messages_sent': messages_sent,
                'talent_pools': company.talent_pools.count(),
            },
            'pipeline': pipeline,
            'recruiters': recruiter_data,
            'recent_jobs': list(recent_jobs),
        })


# ---------------------------------------------------------------------------
# NEW: Recruiter Status (suspend / reactivate)
# ---------------------------------------------------------------------------

class RecruiterStatusView(APIView):
    """Toggle a recruiter's is_active status (suspend / reactivate)."""
    permission_classes = [IsAuthenticated, IsCompanyAdmin]

    def patch(self, request, pk):
        company = Company.objects.filter(created_by=request.user).first()
        if not company:
            return Response({'detail': 'No company.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            recruiter = RecruiterProfile.objects.get(pk=pk, company=company)
        except RecruiterProfile.DoesNotExist:
            return Response({'detail': 'Recruiter not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Prevent admin from suspending themselves
        if recruiter.user == request.user:
            return Response({'detail': 'Cannot suspend yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        is_active = request.data.get('is_active')
        if is_active is None:
            return Response({'detail': 'is_active is required.'}, status=status.HTTP_400_BAD_REQUEST)

        recruiter.is_active = bool(is_active)
        recruiter.save(update_fields=['is_active'])
        return Response(RecruiterProfileSerializer(recruiter).data)


# ---------------------------------------------------------------------------
# NEW: Talent Pools
# ---------------------------------------------------------------------------

class _CompanyMixin:
    """Shared helper: resolve company for company_admin or recruiter."""
    def _get_company(self):
        return _get_company_for_user(self.request.user)


class TalentPoolListCreateView(_CompanyMixin, APIView):
    """List pools or create a new one."""
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get(self, request):
        company = self._get_company()
        if not company:
            return Response([])
        pools = TalentPool.objects.filter(company=company).annotate(
            member_count_ann=Count('members')
        )
        return Response(TalentPoolSerializer(pools, many=True).data)

    def post(self, request):
        company = self._get_company()
        if not company:
            return Response({'detail': 'No company.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = TalentPoolWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        pool = serializer.save(company=company, created_by=request.user)
        return Response(TalentPoolSerializer(pool).data, status=status.HTTP_201_CREATED)


class TalentPoolDetailView(_CompanyMixin, APIView):
    """Retrieve, update, or delete a pool (Company Admin only for edit/delete)."""
    permission_classes = [IsAuthenticated, IsRecruiter]

    def _get_pool(self, pk):
        company = self._get_company()
        try:
            return TalentPool.objects.get(pk=pk, company=company)
        except TalentPool.DoesNotExist:
            return None

    def get(self, request, pk):
        pool = self._get_pool(pk)
        if not pool:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(TalentPoolSerializer(pool).data)

    def patch(self, request, pk):
        if request.user.role not in ('company_admin', 'admin'):
            return Response({'detail': 'Insufficient permissions.'}, status=status.HTTP_403_FORBIDDEN)
        pool = self._get_pool(pk)
        if not pool:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = TalentPoolWriteSerializer(pool, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(TalentPoolSerializer(pool).data)

    def delete(self, request, pk):
        if request.user.role not in ('company_admin', 'admin'):
            return Response({'detail': 'Insufficient permissions.'}, status=status.HTTP_403_FORBIDDEN)
        pool = self._get_pool(pk)
        if not pool:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        pool.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TalentPoolMembersView(_CompanyMixin, APIView):
    """List or add members to a pool."""
    permission_classes = [IsAuthenticated, IsRecruiter]

    def _get_pool(self, pk):
        company = self._get_company()
        try:
            return TalentPool.objects.get(pk=pk, company=company)
        except TalentPool.DoesNotExist:
            return None

    def get(self, request, pk):
        pool = self._get_pool(pk)
        if not pool:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        members = pool.members.select_related('candidate__user', 'added_by').order_by('-added_at')
        return Response(TalentPoolMemberSerializer(members, many=True, context={'request': request}).data)

    def post(self, request, pk):
        pool = self._get_pool(pk)
        if not pool:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        from apps.candidates.models import CandidateProfile
        candidate_id = request.data.get('candidate')
        try:
            candidate = CandidateProfile.objects.get(pk=candidate_id)
        except CandidateProfile.DoesNotExist:
            return Response({'detail': 'Candidate not found.'}, status=status.HTTP_404_NOT_FOUND)
        member, created = TalentPoolMember.objects.get_or_create(
            pool=pool, candidate=candidate,
            defaults={'added_by': request.user, 'notes': request.data.get('notes', '')},
        )
        if not created:
            return Response({'detail': 'Already in pool.'}, status=status.HTTP_400_BAD_REQUEST)
            
        from apps.analytics.signals import log_action_async
        from apps.analytics.models import RecruiterActionLog
        log_action_async(
            recruiter_id=request.user.id,
            candidate_id=candidate.id,
            action_type=RecruiterActionLog.ActionType.TALENT_POOL,
            details={"pool_name": pool.name}
        )
            
        return Response(TalentPoolMemberSerializer(member).data, status=status.HTTP_201_CREATED)


class TalentPoolMemberRemoveView(_CompanyMixin, APIView):
    """Remove a candidate from a pool."""
    permission_classes = [IsAuthenticated, IsRecruiter]

    def delete(self, request, pk, candidate_pk):
        company = self._get_company()
        try:
            pool = TalentPool.objects.get(pk=pk, company=company)
        except TalentPool.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        deleted, _ = TalentPoolMember.objects.filter(pool=pool, candidate_id=candidate_pk).delete()
        if not deleted:
            return Response({'detail': 'Member not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
