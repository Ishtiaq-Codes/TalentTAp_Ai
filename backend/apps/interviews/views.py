from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone

from apps.jobs.models import Job
from apps.interviews.models import AIInterviewSession, AIInterviewQuestion
from apps.interviews.serializers import (
    AIInterviewSessionSerializer, StartInterviewSerializer, 
    SubmitAnswerSerializer, FlagCheatingSerializer
)
from apps.interviews.services import generate_interview_questions, evaluate_interview

class AIInterviewViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AIInterviewSessionSerializer
    queryset = AIInterviewSession.objects.all()

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'candidate_profile'):
            return AIInterviewSession.objects.filter(candidate=user.candidate_profile)
        # recruiters can view candidates' interviews via a different permission later
        return AIInterviewSession.objects.none()

    @action(detail=False, methods=['post'])
    def start(self, request):
        if not hasattr(request.user, 'candidate_profile'):
            return Response({"error": "Only candidates can start interviews."}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = StartInterviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        job_id = serializer.validated_data.get('job_id')
        job = Job.objects.filter(id=job_id).first() if job_id else None
        
        # Create session
        session = AIInterviewSession.objects.create(
            candidate=request.user.candidate_profile,
            job=job,
            status=AIInterviewSession.Status.IN_PROGRESS,
            started_at=timezone.now()
        )
        
        # Generate questions
        success = generate_interview_questions(session)
        if not success:
            session.delete()
            return Response({"error": "Failed to generate interview questions. Please try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        return Response(AIInterviewSessionSerializer(session).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='submit-answer/(?P<question_id>[^/.]+)')
    def submit_answer(self, request, pk=None, question_id=None):
        session = self.get_object()
        if session.status != AIInterviewSession.Status.IN_PROGRESS:
            return Response({"error": "Interview is not in progress."}, status=status.HTTP_400_BAD_REQUEST)
            
        question = get_object_or_404(AIInterviewQuestion, id=question_id, session=session)
        
        serializer = SubmitAnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        question.answer_transcript = serializer.validated_data['transcript']
        question.time_to_answer_seconds = serializer.validated_data['time_to_answer_seconds']
        question.words_per_minute = serializer.validated_data['words_per_minute']
        question.save()
        
        return Response({"status": "success"})

    @action(detail=True, methods=['post'], url_path='flag-cheating')
    def flag_cheating(self, request, pk=None):
        session = self.get_object()
        serializer = FlagCheatingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        flag = f"{timezone.now().isoformat()} - {serializer.validated_data['flag_type']}"
        session.cheat_flags.append(flag)
        session.save()
        
        return Response({"status": "flagged"})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        session = self.get_object()
        if session.status != AIInterviewSession.Status.IN_PROGRESS:
            return Response({"error": "Interview is not in progress."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Evaluate
        success = evaluate_interview(session)
        if not success:
            return Response({"error": "Failed to evaluate interview."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        return Response(AIInterviewSessionSerializer(session).data)
