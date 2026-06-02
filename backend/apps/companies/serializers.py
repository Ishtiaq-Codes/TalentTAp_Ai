"""Company & recruiter serializers."""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Company, RecruiterProfile, CompanyInvitation

User = get_user_model()


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'slug', 'logo', 'description', 'industry',
            'company_size', 'website', 'linkedin_url', 'location',
            'country', 'city', 'is_verified', 'created_at',
        ]
        read_only_fields = ['id', 'slug', 'is_verified', 'created_at']


class RecruiterProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = RecruiterProfile
        fields = ['id', 'user', 'user_email', 'user_name', 'title', 'department', 'is_active', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


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

