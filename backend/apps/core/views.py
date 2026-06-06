from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import StreamingHttpResponse

from apps.accounts.permissions import IsRecruiter
from apps.core.llm import generate_text_stream

class RecruiterCopilotView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsRecruiter]
    
    def post(self, request, *args, **kwargs):
        message = request.data.get('message')
        if not message:
            return Response({"detail": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Optional: inject some context about the recruiter's company
        company_name = getattr(request.user, 'company_name', 'your company')
        
        prompt = f"""
Act as an expert AI Recruiting Copilot for TalentTap AI.
You are assisting a recruiter at {company_name}.
They just sent this message/question:
"{message}"

Provide a highly professional, helpful, and concise response. 
You can help them draft emails, suggest interview questions, explain recruiting strategies, or answer HR questions.
"""
        stream = generate_text_stream(prompt, temperature=0.7)
        return StreamingHttpResponse(stream, content_type='text/plain')
