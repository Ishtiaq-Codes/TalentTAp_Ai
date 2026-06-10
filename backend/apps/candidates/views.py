"""Candidate views — profile, skills, experience, search."""
from rest_framework import generics, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend

from apps.accounts.permissions import IsCandidate, IsRecruiter
from .models import CandidateProfile, CandidateSkill, Experience, Education, Certification
from .filters import CandidateFilter
from .serializers import (
    CandidateProfileSerializer, CandidateSearchSerializer,
    CandidateSkillSerializer, ExperienceSerializer,
    EducationSerializer, CertificationSerializer,
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
        
    def perform_update(self, serializer):
        serializer.save()


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
        
        import threading
        def _process_resume(profile_id):
            from .services import parse_resume
            parse_resume(profile_id)
            from apps.candidates.models import CandidateProfile
            from apps.matching.services import run_matching_for_candidate
            p = CandidateProfile.objects.get(id=profile_id)
            run_matching_for_candidate(p)

        threading.Thread(target=_process_resume, args=(profile.id,)).start()
        
        return Response(CandidateProfileSerializer(profile).data)


class CandidateBannerUploadView(generics.UpdateAPIView):
    """Upload banner image."""
    serializer_class = CandidateProfileSerializer
    permission_classes = [IsAuthenticated, IsCandidate]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return profile

    def patch(self, request, *args, **kwargs):
        profile = self.get_object()
        banner_image = request.FILES.get('banner_image')
        if not banner_image:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        profile.banner_image = banner_image
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
# Education
# ---------------------------------------------------------------------------

class EducationListCreateView(generics.ListCreateAPIView):
    serializer_class = EducationSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_queryset(self):
        profile = CandidateProfile.objects.filter(user=self.request.user).first()
        return Education.objects.filter(candidate=profile) if profile else Education.objects.none()

    def perform_create(self, serializer):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        serializer.save(candidate=profile)


class EducationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EducationSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_queryset(self):
        profile = CandidateProfile.objects.filter(user=self.request.user).first()
        return Education.objects.filter(candidate=profile) if profile else Education.objects.none()


# ---------------------------------------------------------------------------
# Certifications
# ---------------------------------------------------------------------------

class CertificationListCreateView(generics.ListCreateAPIView):
    serializer_class = CertificationSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_queryset(self):
        profile = CandidateProfile.objects.filter(user=self.request.user).first()
        return Certification.objects.filter(candidate=profile) if profile else Certification.objects.none()

    def perform_create(self, serializer):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        serializer.save(candidate=profile)


class CertificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CertificationSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_queryset(self):
        profile = CandidateProfile.objects.filter(user=self.request.user).first()
        return Certification.objects.filter(candidate=profile) if profile else Certification.objects.none()


# ---------------------------------------------------------------------------
# Candidate Search (for recruiters)
# ---------------------------------------------------------------------------

class CandidateSearchView(generics.ListAPIView):
    """Search candidates — accessible to recruiters."""
    serializer_class = CandidateSearchSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CandidateFilter
    search_fields = ['headline', 'skills__name', 'user__first_name', 'user__last_name']
    ordering_fields = ['years_of_experience', 'updated_at']

    def get_queryset(self):
        return CandidateProfile.objects.filter(
            is_open_to_work=True,
        ).select_related('user').prefetch_related('skills')

class CandidateTopView(generics.ListAPIView):
    """Returns globally top-ranked candidates based on organic learning loop, or semantic NLP match if job_id provided."""
    serializer_class = CandidateSearchSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = CandidateFilter
    search_fields = ['headline', 'skills__name', 'user__first_name', 'user__last_name']
    
    def get_queryset(self):
        job_id = self.request.query_params.get('job_id')
        if job_id:
            from apps.candidates.services import get_job_match_ranking_queryset
            from apps.jobs.models import Job
            job = Job.objects.filter(id=job_id).first()
            if job:
                # Pre-calculation loop removed. Relies on organic scores saved in background.
                return get_job_match_ranking_queryset(job.id).select_related('user').prefetch_related('skills')
            
        from apps.candidates.services import get_organic_ranking_queryset
        return get_organic_ranking_queryset().select_related('user').prefetch_related('skills')

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        
        job_id = self.request.query_params.get('job_id')
        data = response.data.get('results', response.data) if isinstance(response.data, dict) and 'results' in response.data else response.data
        
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        objs = page if page is not None else queryset
        
        if job_id:
            from apps.jobs.models import Job
            from apps.matching.engine import batch_evaluate_candidates_llm
            job = Job.objects.filter(id=job_id).first()
            
            top_candidates = list(objs)[:10]
            if job and top_candidates:
                ai_results = batch_evaluate_candidates_llm(job, top_candidates)
                
                for i, item in enumerate(data[:10]):
                    try:
                        c_id = str(objs[i].id)
                        if c_id in ai_results:
                            item.update(ai_results[c_id])
                        else:
                            from apps.candidates.services import generate_relevance_data
                            item.update(generate_relevance_data(objs[i], job_id=job_id))
                    except IndexError:
                        pass
                
                # Re-sort the Top 10 using their new AI-generated scores before sending to frontend!
                data[:10] = sorted(data[:10], key=lambda x: x.get('ranking_score', 0), reverse=True)
        else:
            from apps.candidates.services import generate_relevance_data
            for i, item in enumerate(data):
                try:
                    item.update(generate_relevance_data(objs[i], job_id=job_id))
                except IndexError:
                    pass
                
        return response

class CandidateRecommendedView(CandidateTopView):
    """Returns top candidates tailored slightly to the recruiter's recent activity (placeholder for future deep ML)."""
    # Currently mirrors TopView but can be expanded to filter by recruiter's industry/company
    pass


class CandidatePublicProfileView(generics.RetrieveAPIView):
    """View a candidate's profile (recruiter view)."""
    serializer_class = CandidateProfileSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]
    queryset = CandidateProfile.objects.select_related('user').prefetch_related('skills', 'experiences', 'education', 'certifications')

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        
        # Asynchronously log the view action
        from apps.analytics.signals import log_action_async
        from apps.analytics.models import RecruiterActionLog
        
        # We know request.user is authenticated and a recruiter because of permission_classes
        candidate = self.get_object()
        log_action_async(
            recruiter_id=request.user.id,
            candidate_id=candidate.id,
            action_type=RecruiterActionLog.ActionType.VIEW
        )
        
        # Inject AI intelligence into the single profile view
        job_id = request.query_params.get('job_id')
        from .services import generate_relevance_data
        ai_data = generate_relevance_data(candidate, job_id=job_id)
        if isinstance(response.data, dict):
            response.data.update(ai_data)
        
        return response


class CandidateOutreachView(generics.RetrieveAPIView):
    """Returns an AI-generated outreach message for a candidate."""
    queryset = CandidateProfile.objects.all()
    permission_classes = [IsAuthenticated, IsRecruiter]
    
    def retrieve(self, request, *args, **kwargs):
        candidate = self.get_object()
        job_id = request.query_params.get('job_id')
        
        if request.query_params.get('stream') == 'true':
            from django.http import StreamingHttpResponse
            from .services import generate_outreach_draft_stream
            stream = generate_outreach_draft_stream(candidate, job_id, recruiter_user=request.user)
            return StreamingHttpResponse(stream, content_type='text/plain')
        else:
            from .services import generate_outreach_draft
            draft = generate_outreach_draft(candidate, job_id, recruiter_user=request.user)
            return Response(draft)


class CandidateInterviewPrepView(generics.RetrieveAPIView):
    """Returns AI-generated interview questions for a candidate."""
    queryset = CandidateProfile.objects.all()
    permission_classes = [IsAuthenticated, IsRecruiter]
    
    def retrieve(self, request, *args, **kwargs):
        candidate = self.get_object()
        job_id = request.query_params.get('job_id')
        
        if request.query_params.get('stream') == 'true':
            from django.http import StreamingHttpResponse
            from .services import generate_interview_questions_stream
            stream = generate_interview_questions_stream(candidate, job_id)
            return StreamingHttpResponse(stream, content_type='text/plain')
        else:
            from .services import generate_interview_questions
            questions = generate_interview_questions(candidate, job_id)
            return Response({"questions": questions})


class CandidateCoverLetterView(generics.GenericAPIView):
    """Returns an AI-generated cover letter stream for a candidate."""
    permission_classes = [IsAuthenticated, IsCandidate]
    
    def get(self, request, *args, **kwargs):
        from .models import CandidateProfile
        candidate = CandidateProfile.objects.filter(user=request.user).first()
        if not candidate:
            return Response({"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
            
        job_id = request.query_params.get('job_id')
        if not job_id:
            return Response({"detail": "job_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        from django.http import StreamingHttpResponse
        from .services import generate_cover_letter_stream
        stream = generate_cover_letter_stream(candidate, job_id)
        return StreamingHttpResponse(stream, content_type='text/plain')
