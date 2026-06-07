from rest_framework import serializers
from .models import RecruiterActionLog

class RecruiterActionLogSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source='candidate.user.full_name', read_only=True)
    candidate_avatar = serializers.ImageField(source='candidate.user.avatar', read_only=True)
    candidate_headline = serializers.CharField(source='candidate.headline', read_only=True)
    candidate_id = serializers.UUIDField(source='candidate.id', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)

    class Meta:
        model = RecruiterActionLog
        fields = [
            'id', 'action_type', 'timestamp', 
            'candidate_id', 'candidate_name', 'candidate_avatar', 'candidate_headline',
            'job_title', 'details'
        ]
