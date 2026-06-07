from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.throttling import AnonRateThrottle
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

CRITICAL INSTRUCTIONS:
1. Provide a highly professional, helpful, but extremely concise response.
2. Talk like a real human in a live chat. Give 1-3 sentences max. Do NOT write long paragraphs.
3. DO NOT say "Hello", "Hi", or greet the user. Jump straight into the answer.
"""
        elif role == 'company_admin':
            company_name = getattr(user, 'company_name', 'your company')
            prompt = f"""
Act as an expert AI Admin Copilot for TalentTap AI.
You are assisting a Company Admin at {company_name}.
They just sent this message/question:
"{message}"

CRITICAL INSTRUCTIONS:
1. Provide a helpful but extremely concise response.
2. Talk like a real human in a live chat. Give 1-3 sentences max. Do NOT write long paragraphs.
3. DO NOT say "Hello", "Hi", or greet the user. Jump straight into the answer.
"""
        else: # candidate
            prompt = f"""
Act as an expert AI Career Copilot for TalentTap AI.
You are assisting a job candidate named {user.full_name}.
They just sent this message/question:
"{message}"

CRITICAL INSTRUCTIONS:
1. Provide a highly encouraging, helpful, but extremely concise response.
2. Talk like a real human in a live chat. Give 1-3 sentences max. Do NOT write long paragraphs.
3. DO NOT say "Hello", "Hi", or greet the user. Jump straight into the answer.
"""
        
        prompt += "\nIMPORTANT INSTRUCTION: Do NOT use markdown formatting (no asterisks, no bold text, no bullet points). Provide plain, clean, conversational human-style text."

        stream = generate_text_stream(prompt, temperature=0.7)
        return StreamingHttpResponse(stream, content_type='text/plain')


class PublicChatView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]
    
    def post(self, request, *args, **kwargs):
        message = request.data.get('message')
        if not message:
            return Response({"detail": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        prompt = f"""
Act as a friendly, expert AI Customer Support and Sales Agent for TalentTap AI.
You are assisting a visitor on our public website.
They just sent this message/question:
"{message}"

CRITICAL INSTRUCTIONS:
1. Provide a highly professional, helpful, and persuasive response.
2. Be extremely concise. Talk like a real human in a live chat. Give 1-3 short sentences max. Do NOT write long paragraphs.
3. DO NOT say "Hello", "Hi", or greet the user. Jump straight into the answer.

You must answer questions about the platform using this context:
- What it is: An AI-powered SaaS recruitment and job matching platform.
- How it works: Companies post jobs, candidates create profiles, and our AI Matching Engine instantly scores candidates against job requirements.
- Pricing: We offer flexible tiered pricing including Free, Pro, and Enterprise plans.
- Features: AI Matching, Automated Skill Extraction, Resume Parsing, Talent Pools, Analytics Dashboard, Smart Shortlisting, and Real-time Recruiter Team Activity Tracking.
- Who can use: Recruiters, HR Teams, Company Admins, and Job Seekers.
- How to set up: Click "Sign Up" or "Get Started" to create an account and follow our simple onboarding wizard.
"""
        prompt += "\nIMPORTANT INSTRUCTION: Do NOT use markdown formatting (no asterisks, no bold text, no bullet points). Provide plain, clean, conversational human-style text."

        stream = generate_text_stream(prompt, temperature=0.7)
        return StreamingHttpResponse(stream, content_type='text/plain')
