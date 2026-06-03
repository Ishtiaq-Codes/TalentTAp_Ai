"""Candidate serializers."""
from rest_framework import serializers
from .models import CandidateProfile, CandidateSkill, Experience


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


class CandidateProfileSerializer(serializers.ModelSerializer):
    skills = CandidateSkillSerializer(many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    avatar = serializers.ImageField(source='user.avatar', read_only=True)

    class Meta:
        model = CandidateProfile
        fields = [
            'id', 'user', 'user_name', 'user_email', 'avatar',
            'headline', 'about', 'country', 'city', 'phone',
            'years_of_experience', 'employment_status', 'availability',
            'employment_type_preferred', 'salary_min', 'salary_max',
            'salary_currency', 'linkedin_url', 'github_url', 'portfolio_url',
            'resume', 'banner_image', 'is_open_to_work', 'profile_completion',
            'skills', 'experiences', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'user', 'profile_completion', 'created_at', 'updated_at']


class CandidateSearchSerializer(serializers.ModelSerializer):
    """Lightweight serializer for search results."""
    is_shortlisted = serializers.SerializerMethodField()
    user_id = serializers.UUIDField(source='user.id', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    avatar = serializers.ImageField(source='user.avatar', read_only=True)
    skills = CandidateSkillSerializer(many=True, read_only=True)

    class Meta:
        model = CandidateProfile
        fields = [
            'id', 'user_id', 'user_name', 'avatar', 'banner_image', 'headline', 'country', 'city',
            'years_of_experience', 'employment_status', 'availability',
            'employment_type_preferred', 'is_open_to_work', 'skills', 'is_shortlisted',
        ]

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
