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

    match_explainer = serializers.SerializerMethodField()

    class Meta:
        model = MatchScore
        fields = [
            'id', 'job', 'candidate_id', 'candidate_user_id', 'candidate_name', 'candidate_headline',
            'candidate_avatar', 'job_title', 'company_name',
            'overall_score', 'skills_score', 'experience_score',
            'location_score', 'availability_score', 'employment_type_score',
            'breakdown', 'created_at', 'match_explainer'
        ]

    def get_match_explainer(self, obj):
        breakdown = obj.breakdown or {}
        skills_bd = breakdown.get('skills', {}) if isinstance(breakdown, dict) else {}
        matched = skills_bd.get('matched', []) if isinstance(skills_bd, dict) else []
        missing = skills_bd.get('missing', []) if isinstance(skills_bd, dict) else []
        
        score = obj.overall_score or 0
        
        if score >= 85:
            prefix = "Outstanding match:"
        elif score >= 70:
            prefix = "Strong match:"
        else:
            prefix = "Potential match:"
            
        parts = []
        if matched:
            parts.append(f"has required skills like {', '.join(matched[:3])}")
        
        if missing:
            parts.append(f"but may need onboarding for {', '.join(missing[:2])}")
            
        if not parts:
            return f"{prefix} Meets basic criteria for the role."
            
        return f"{prefix} {' '.join(parts)}."
