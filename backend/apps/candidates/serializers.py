"""Candidate serializers."""
from rest_framework import serializers
from .models import CandidateProfile, CandidateSkill, Experience, Education, Certification


class CandidateSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateSkill
        fields = ['id', 'name', 'proficiency']
        read_only_fields = ['id']


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = [
            'id', 'company_name', 'title', 'start_date',
            'end_date', 'is_current', 'description',
        ]
        read_only_fields = ['id']


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = [
            'id', 'institution_name', 'degree', 'field_of_study',
            'start_date', 'end_date', 'description',
        ]
        read_only_fields = ['id']


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = [
            'id', 'name', 'issuing_organization', 'issue_date',
            'expiration_date', 'credential_id', 'credential_url',
        ]
        read_only_fields = ['id']


class CandidateProfileSerializer(serializers.ModelSerializer):
    skills = CandidateSkillSerializer(many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    avatar = serializers.ImageField(source='user.avatar', read_only=True)
    
    # AI Intelligence Fields (injected via annotations or service logic)
    ranking_score = serializers.FloatField(read_only=True, required=False)
    relevance_factors = serializers.JSONField(read_only=True, required=False)
    missing_factors = serializers.JSONField(read_only=True, required=False)
    match_reason = serializers.CharField(read_only=True, required=False)
    is_flight_risk = serializers.BooleanField(read_only=True)
    verified_expert = serializers.SerializerMethodField()
    interviews_summary = serializers.SerializerMethodField()

    class Meta:
        model = CandidateProfile
        fields = [
            'id', 'user', 'user_name', 'user_email', 'avatar',
            'headline', 'about', 'country', 'city', 'phone',
            'years_of_experience', 'employment_status', 'availability',
            'employment_type_preferred', 'remote_preference', 'career_goals', 
            'salary_min', 'salary_max', 'salary_currency', 'linkedin_url', 
            'github_url', 'portfolio_url', 'resume', 'banner_image', 
            'is_open_to_work', 'profile_completion', 'skills', 'experiences', 
            'education', 'certifications', 'created_at', 'updated_at',
            'ranking_score', 'relevance_factors', 'missing_factors', 'match_reason',
            'is_flight_risk', 'verified_expert', 'interviews_summary',
        ]
        read_only_fields = ['id', 'user', 'profile_completion', 'created_at', 'updated_at']

    def get_verified_expert(self, obj):
        # Return true if candidate passed any AI interview
        return obj.interviews.filter(passed=True).exists()

    def get_interviews_summary(self, obj):
        qs = obj.interviews.filter(status='completed')
        return [
            {
                "id": str(i.id),
                "technical_score": i.technical_score,
                "soft_skills_score": i.soft_skills_score,
                "overall_score": i.overall_score,
                "passed": i.passed,
                "completed_at": i.completed_at,
                "ai_feedback_summary": i.ai_feedback_summary
            } for i in qs
        ]

class CandidateSearchSerializer(serializers.ModelSerializer):
    """Lightweight serializer for search results."""
    is_shortlisted = serializers.SerializerMethodField()
    user_id = serializers.UUIDField(source='user.id', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    avatar = serializers.ImageField(source='user.avatar', read_only=True)
    skills = CandidateSkillSerializer(many=True, read_only=True)
    
    # AI Intelligence Fields (injected via annotations or service logic)
    ranking_score = serializers.FloatField(read_only=True, required=False)
    relevance_factors = serializers.JSONField(read_only=True, required=False)
    missing_factors = serializers.JSONField(read_only=True, required=False)
    match_reason = serializers.CharField(read_only=True, required=False)
    is_flight_risk = serializers.BooleanField(read_only=True)
    verified_expert = serializers.SerializerMethodField()

    class Meta:
        model = CandidateProfile
        fields = [
            'id', 'user_id', 'user_name', 'avatar', 'banner_image', 'headline', 'country', 'city',
            'years_of_experience', 'employment_status', 'availability',
            'employment_type_preferred', 'is_open_to_work', 'skills', 'is_shortlisted',
            'ranking_score', 'relevance_factors', 'missing_factors', 'match_reason',
            'is_flight_risk', 'verified_expert',
        ]

    def get_verified_expert(self, obj):
        return obj.interviews.filter(passed=True).exists()

    def get_is_shortlisted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role in ('recruiter', 'company_admin'):
            from apps.companies.models import RecruiterProfile
            from apps.applications.models import Shortlist
            profile = RecruiterProfile.objects.filter(user=request.user).first()
            if not profile and request.user.role == 'company_admin':
                company = getattr(request.user, 'owned_companies', None)
                if company and company.exists():
                    profile = RecruiterProfile.objects.filter(company=company.first()).first()
            if profile:
                return Shortlist.objects.filter(recruiter=profile, candidate=obj).exists()
        return False
