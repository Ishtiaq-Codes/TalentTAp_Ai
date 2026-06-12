"""Job serializers."""
from rest_framework import serializers
from .models import Job, JobSkill


class JobSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobSkill
        fields = ['id', 'name', 'is_required']
        read_only_fields = ['id']


class JobSerializer(serializers.ModelSerializer):
    skills = JobSkillSerializer(many=True, required=False)
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_logo = serializers.ImageField(source='company.logo', read_only=True)
    recruiter_name = serializers.CharField(source='recruiter.user.full_name', read_only=True)
    applicants_count = serializers.IntegerField(read_only=True)
    has_applied = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'company', 'company_name', 'company_logo',
            'recruiter', 'recruiter_name', 'title', 'department', 'slug', 'description',
            'experience_min', 'experience_max', 'employment_type',
            'location', 'country', 'city', 'is_remote',
            'salary_min', 'salary_max', 'salary_currency',
            'status', 'application_deadline', 'is_featured', 'auto_headhunt',
            'skills', 'applicants_count', 'created_at', 'updated_at', 'has_applied',
        ]
        read_only_fields = ['id', 'slug', 'company', 'recruiter', 'created_at', 'updated_at']

    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'candidate':
            from apps.candidates.models import CandidateProfile
            from apps.applications.models import Application
            profile = CandidateProfile.objects.filter(user=request.user).first()
            if profile:
                return Application.objects.filter(candidate=profile, job=obj).exists()
        return False

    def create(self, validated_data):
        skills_data = validated_data.pop('skills', [])
        job = Job.objects.create(**validated_data)
        for skill in skills_data:
            JobSkill.objects.create(job=job, **skill)
        return job

    def update(self, instance, validated_data):
        skills_data = validated_data.pop('skills', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if skills_data is not None:
            instance.skills.all().delete()
            for skill in skills_data:
                JobSkill.objects.create(job=instance, **skill)
        return instance


class JobListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for job lists."""
    has_applied = serializers.SerializerMethodField()
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_logo = serializers.ImageField(source='company.logo', read_only=True)
    skills = JobSkillSerializer(many=True, read_only=True)
    applicants_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'department', 'slug', 'company_name', 'company_logo',
            'employment_type', 'location', 'country', 'city', 'is_remote',
            'salary_min', 'salary_max', 'salary_currency',
            'status', 'is_featured', 'skills', 'applicants_count', 'created_at', 'has_applied',
        ]

    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'candidate':
            from apps.candidates.models import CandidateProfile
            from apps.applications.models import Application
            profile = CandidateProfile.objects.filter(user=request.user).first()
            if profile:
                return Application.objects.filter(candidate=profile, job=obj).exists()
        return False
