from rest_framework import serializers
from apps.interviews.models import AIInterviewSession, AIInterviewQuestion

class AIInterviewQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIInterviewQuestion
        fields = ['id', 'question_text', 'question_type', 'order', 'answer_transcript', 'time_to_answer_seconds', 'words_per_minute', 'ai_score', 'ai_feedback']
        read_only_fields = ['ai_score', 'ai_feedback', 'question_text', 'question_type', 'order']

class AIInterviewSessionSerializer(serializers.ModelSerializer):
    questions = AIInterviewQuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = AIInterviewSession
        fields = ['id', 'candidate', 'job', 'status', 'started_at', 'completed_at', 'technical_score', 'soft_skills_score', 'overall_score', 'passed', 'cheat_flags', 'ai_feedback_summary', 'questions']
        read_only_fields = ['technical_score', 'soft_skills_score', 'overall_score', 'passed', 'ai_feedback_summary', 'cheat_flags']

class StartInterviewSerializer(serializers.Serializer):
    job_id = serializers.IntegerField(required=False)

class SubmitAnswerSerializer(serializers.Serializer):
    transcript = serializers.CharField(allow_blank=True)
    time_to_answer_seconds = serializers.IntegerField()
    words_per_minute = serializers.IntegerField()

class FlagCheatingSerializer(serializers.Serializer):
    flag_type = serializers.CharField()
