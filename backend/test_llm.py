import json
from apps.accounts.models import User
from apps.candidates.models import CandidateProfile
from apps.interviews.models import AIInterviewSession

c_user = User.objects.filter(first_name__icontains='brand').first()
profile = CandidateProfile.objects.get(user=c_user)
session = AIInterviewSession.objects.filter(candidate=profile).order_by('-created_at').first()
questions = session.questions.all().order_by('order')

interview_data = []
for q in questions:
    interview_data.append({
        'id': str(q.id),
        'question': q.question_text,
        'type': q.question_type,
        'transcript': q.answer_transcript or '[No Answer]',
        'words_per_minute': q.words_per_minute or 0,
        'time_to_answer_seconds': q.time_to_answer_seconds or 0
    })
    
prompt = f"""
You are an elite Senior Engineering Manager evaluating a candidate's recorded interview.
You must score them extremely strictly.

CRITICAL GRADING RULES:
1. If the transcript for an answer is very short (e.g. under 15 words) or nonsensical, you MUST give a score of exactly 0 for that question. Do not give partial credit.
2. If the answer does not accurately and comprehensively address the question, score it below 20%.
3. Evaluate Technical Accuracy and Soft Skills rigorously. Filler words, hesitation, or lack of deep detail should severely lower the score.
4. Note: 130-160 WPM is a confident speaking rate. Very low WPM or extremely long time_to_answer indicates hesitation.
5. CRITICAL: Analyze the transcript. If the candidate answered a technical question exceptionally well (>80% score) regarding a specific technology or framework (e.g., "React", "Python", "SEO", "Figma"), extract the name of that technology into the `verified_skills` array.

Interview Data:
{json.dumps(interview_data)}

Return a strict JSON object with this exact schema:
{{
    "technical_score": <0-100 float>,
    "soft_skills_score": <0-100 float>,
    "overall_score": <0-100 float>,
    "feedback_summary": "<A 2-paragraph summary of their performance>",
    "verified_skills": ["React", "Python"],
    "question_evaluations": [
        {{
            "id": "<question_id>",
            "score": <0-100 float>,
            "feedback": "<1-2 sentence feedback on this specific answer>"
        }}
    ]
}}
"""

from groq import Groq
from django.conf import settings
import os

try:
    key = getattr(settings, 'GROQ_API_KEY', os.environ.get('GROQ_API_KEY'))
    client = Groq(api_key=key)
    response = client.chat.completions.create(
        messages=[{'role': 'user', 'content': prompt}],
        model='llama-3.1-8b-instant',
        temperature=0.1
    )
    print('\n--- Raw output from LLM ---')
    print(response.choices[0].message.content)
except Exception as e:
    print('Groq Error:', e)
