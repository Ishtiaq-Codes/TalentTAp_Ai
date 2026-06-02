"""Application & shortlist serializers."""
from rest_framework import serializers
from .models import Application, Shortlist


class ApplicationSerializer(serializers.ModelSerializer):
    candidate_user_id = serializers.UUIDField(source='candidate.user.id', read_only=True)
    candidate_name = serializers.CharField(source='candidate.user.full_name', read_only=True)
    candidate_headline = serializers.CharField(source='candidate.headline', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.CharField(source='job.company.name', read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'job', 'candidate', 'candidate_user_id', 'candidate_name', 'candidate_headline',
            'job_title', 'company_name', 'status', 'cover_letter',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'candidate', 'created_at', 'updated_at']


class ApplicationStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Application.Status.choices)


class ShortlistSerializer(serializers.ModelSerializer):
    candidate_user_id = serializers.UUIDField(source='candidate.user.id', read_only=True)
    candidate_name = serializers.CharField(source='candidate.user.full_name', read_only=True)
    candidate_headline = serializers.CharField(source='candidate.headline', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True, default=None)

    class Meta:
        model = Shortlist
        fields = [
            'id', 'recruiter', 'candidate', 'candidate_user_id', 'candidate_name',
            'candidate_headline', 'job', 'job_title', 'notes', 'created_at',
        ]
        read_only_fields = ['id', 'recruiter', 'created_at']
