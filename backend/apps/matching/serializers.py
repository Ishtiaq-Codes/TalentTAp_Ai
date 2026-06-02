"""Matching serializers."""
from rest_framework import serializers
from .models import MatchScore


class MatchScoreSerializer(serializers.ModelSerializer):
    candidate_user_id = serializers.UUIDField(source='candidate.user.id', read_only=True)
    candidate_name = serializers.CharField(source='candidate.user.full_name', read_only=True)
    candidate_headline = serializers.CharField(source='candidate.headline', read_only=True)
    candidate_avatar = serializers.ImageField(source='candidate.user.avatar', read_only=True)
    candidate_id = serializers.UUIDField(source='candidate.id', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.CharField(source='job.company.name', read_only=True)

    class Meta:
        model = MatchScore
        fields = [
            'id', 'job', 'candidate_id', 'candidate_user_id', 'candidate_name', 'candidate_headline',
            'candidate_avatar', 'job_title', 'company_name',
            'overall_score', 'skills_score', 'experience_score',
            'location_score', 'availability_score', 'employment_type_score',
            'breakdown', 'created_at',
        ]
