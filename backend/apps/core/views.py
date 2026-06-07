from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import StreamingHttpResponse

from apps.core.llm import generate_text_stream

class CopilotView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        message = request.data.get('message')
        if not message:
            return Response({"detail": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        user = request.user
        role = getattr(user, 'role', 'user')
        
        if role == 'recruiter':
            company_name = getattr(user, 'company_name', 'your company')
            prompt = f"""
Act as an expert AI Recruiting Copilot for TalentTap AI.
You are assisting a recruiter at {company_name}.
They just sent this message/question:
"{message}"

Provide a highly professional, helpful, and concise response. 
You can help them draft emails, suggest interview questions, explain recruiting strategies, or answer HR questions.
"""
        elif role == 'company_admin':
            company_name = getattr(user, 'company_name', 'your company')
            prompt = f"""
Act as an expert AI Admin Copilot for TalentTap AI.
You are assisting a Company Admin at {company_name}.
They just sent this message/question:
"{message}"

Provide a helpful, concise response. You can guide them on setting up their company profile, managing recruiters, billing, or general TalentTap platform goodness.
"""
        else: # candidate
            prompt = f"""
Act as an expert AI Career Copilot for TalentTap AI.
You are assisting a job candidate named {user.full_name}.
They just sent this message/question:
"{message}"

Provide a highly encouraging, helpful, and concise response.
You can help them optimize their profile, prepare for interviews, or explain how the TalentTap platform can help them find jobs.
"""
        
        prompt += "\nIMPORTANT INSTRUCTION: Do NOT use markdown formatting (no asterisks, no bold text, no bullet points). Provide plain, clean, conversational human-style text."

        stream = generate_text_stream(prompt, temperature=0.7)
        return StreamingHttpResponse(stream, content_type='text/plain')
