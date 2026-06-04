"""Company & recruiter serializers."""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Company, RecruiterProfile, CompanyInvitation, TalentPool, TalentPoolMember

User = get_user_model()


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'slug', 'logo', 'banner_image', 'description', 'industry',
            'company_size', 'website', 'linkedin_url', 'location',
            'country', 'city', 'is_verified', 'created_at',
        ]
        read_only_fields = ['id', 'slug', 'is_verified', 'created_at']


class RecruiterProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    avatar = serializers.ImageField(source='user.avatar', read_only=True)
    jobs_count = serializers.SerializerMethodField()
    shortlists_count = serializers.SerializerMethodField()
    messages_count = serializers.SerializerMethodField()

    class Meta:
        model = RecruiterProfile
        fields = [
            'id', 'user', 'user_email', 'user_name', 'avatar',
            'title', 'department', 'is_active', 'created_at',
            'jobs_count', 'shortlists_count', 'messages_count',
        ]
        read_only_fields = ['id', 'user', 'created_at']

    def get_jobs_count(self, obj):
        return obj.jobs.count()

    def get_shortlists_count(self, obj):
        return obj.shortlists.count()

    def get_messages_count(self, obj):
        return obj.user.sent_messages.count()


class InviteRecruiterSerializer(serializers.Serializer):
    """Invite a new recruiter — creates an invitation token."""
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    title = serializers.CharField(max_length=100, required=False, default='')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value


class CompanyInvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyInvitation
        fields = ['id', 'email', 'first_name', 'last_name', 'title', 'status', 'created_at', 'expires_at']


# ---------------------------------------------------------------------------
# Talent Pool serializers
# ---------------------------------------------------------------------------

class TalentPoolMemberSerializer(serializers.ModelSerializer):
    candidate_id = serializers.UUIDField(source='candidate.id', read_only=True)
    candidate_name = serializers.CharField(source='candidate.user.full_name', read_only=True)
    candidate_headline = serializers.CharField(source='candidate.headline', read_only=True)
    candidate_avatar = serializers.SerializerMethodField()
    candidate_city = serializers.CharField(source='candidate.city', read_only=True)
    candidate_country = serializers.CharField(source='candidate.country', read_only=True)
    added_by_name = serializers.SerializerMethodField()

    def get_candidate_avatar(self, obj):
        request = self.context.get('request')
        avatar = obj.candidate.user.avatar
        if avatar and request:
            return request.build_absolute_uri(avatar.url)
        return None

    def get_added_by_name(self, obj):
        return obj.added_by.full_name if obj.added_by else 'Unknown'

    class Meta:
        model = TalentPoolMember
        fields = [
            'id', 'candidate_id', 'candidate_name', 'candidate_headline',
            'candidate_avatar', 'candidate_city', 'candidate_country',
            'added_by_name', 'added_at', 'notes',
        ]
        read_only_fields = ['id', 'added_at']


class TalentPoolSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    member_candidate_ids = serializers.SerializerMethodField()

    class Meta:
        model = TalentPool
        fields = ['id', 'name', 'description', 'member_count', 'member_candidate_ids', 'created_by_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_member_count(self, obj):
        return obj.members.count()

    def get_member_candidate_ids(self, obj):
        # Return a list of candidate UUID strings
        return [str(c_id) for c_id in obj.members.values_list('candidate_id', flat=True)]


class TalentPoolWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TalentPool
        fields = ['name', 'description']
