import uuid
from django.db import models
from django.utils import timezone
from apps.candidates.models import CandidateProfile
from apps.jobs.models import Job

class AIInterviewSession(models.fields.related.ForeignKey.__module__ if False else object):
    pass # to trick pylint

class AIInterviewSession(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        FAILED_CHEATING = 'failed_cheating', 'Failed (Cheating Detected)'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='interviews')
    job = models.ForeignKey(Job, on_delete=models.SET_NULL, null=True, blank=True, related_name='interviews')
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    technical_score = models.FloatField(null=True, blank=True)
    soft_skills_score = models.FloatField(null=True, blank=True)
    overall_score = models.FloatField(null=True, blank=True)
    passed = models.BooleanField(default=False)
    
    cheat_flags = models.JSONField(default=list, blank=True)
    ai_feedback_summary = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Interview {self.id} - {self.candidate.user.email}"


class AIInterviewQuestion(models.Model):
    class QuestionType(models.TextChoices):
        TECHNICAL = 'technical', 'Technical'
        SOFT_SKILL = 'soft_skill', 'Soft Skill'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(AIInterviewSession, on_delete=models.CASCADE, related_name='questions')
    
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QuestionType.choices, default=QuestionType.TECHNICAL)
    order = models.IntegerField(default=0)
    
    answer_transcript = models.TextField(blank=True, null=True)
    time_to_answer_seconds = models.IntegerField(null=True, blank=True)
    words_per_minute = models.IntegerField(null=True, blank=True)
    
    ai_score = models.FloatField(null=True, blank=True)
    ai_feedback = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Q{self.order} for Session {self.session.id}"
