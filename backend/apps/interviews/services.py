import json
import logging
import time
from django.utils import timezone
from apps.core.llm import generate_json
from apps.interviews.models import AIInterviewSession, AIInterviewQuestion

logger = logging.getLogger(__name__)

def generate_interview_questions(session: AIInterviewSession) -> bool:
    """
    Uses Gemini to generate 10 highly contextual interview questions 
    (7 Technical, 3 Soft Skill) based on candidate's resume and job description.
    """
    candidate = session.candidate
    job = session.job
    
    resume_context = f"Skills: {candidate.skills}\\nExperience: {candidate.years_of_experience} years\\nAbout: {candidate.about}"
    if candidate.resume and hasattr(candidate.resume, 'parsed_data') and candidate.resume.parsed_data:
        resume_context += f"\\nParsed Resume Data: {json.dumps(candidate.resume.parsed_data)}"
        resume_context += f"\nParsed Resume Data: {json.dumps(candidate.resume.parsed_data)}"
        
    job_context = "General senior role evaluation."
    if job:
        job_context = f"Job Title: {job.title}\nDescription: {job.description}\nRequirements: {job.requirements}"

    prompt = f"""
    You are an elite Senior Engineering Manager and HR Director. 
    You are interviewing a candidate for a position.
    
    Candidate Context:
    {resume_context}
    
    Job Context:
    {job_context}
    
    Generate exactly 10 interview questions tailored specifically to the candidate's resume and the job's demands.
    - 7 should be 'technical' (deep dives into their claimed skills, scenario-based architecture or coding questions).
    - 3 should be 'soft_skill' (behavioral, leadership, conflict resolution).
    
    Format the output as a strict JSON array of objects:
    {{
        "questions": [
            {{"question_text": "Your question here...", "type": "technical"}},
            ...
        ]
    }}
    """
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            result = generate_json(prompt, model_name="gemini-2.5-flash", temperature=0.7)
            
            if not result:
                raise Exception("Empty result from LLM")

            questions_data = result.get('questions', [])
            
            if not questions_data or len(questions_data) < 5:
                logger.error("LLM failed to generate sufficient questions. Raising exception.")
                raise Exception("LLM generated insufficient questions.")
                
            for idx, q_data in enumerate(questions_data):
                q_type = AIInterviewQuestion.QuestionType.TECHNICAL if q_data.get('type') == 'technical' else AIInterviewQuestion.QuestionType.SOFT_SKILL
                AIInterviewQuestion.objects.create(
                    session=session,
                    question_text=q_data.get('question_text'),
                    question_type=q_type,
                    order=idx + 1
                )
                
            return True
        except Exception as e:
            logger.error(f"Failed to generate questions on attempt {attempt+1}: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            else:
                logger.error("Max retries reached for questions. Raising to frontend.")
                return False


def evaluate_interview(session: AIInterviewSession) -> bool:
    """
    Uses Gemini to grade the interview answers, taking into account the spoken transcript
    and confidence meta-data (WPM, time to answer).
    """
    questions = session.questions.all()
    
    # Advanced Anti-Cheat: Strict Validation
    total_words = sum(
        len(str(q.answer_transcript).strip().split()) 
        for q in questions if q.answer_transcript
    )
    if total_words < 5:
        logger.warning(f"Candidate {session.candidate.user.email} submitted empty or near-empty answers.")
        session.status = AIInterviewSession.Status.FAILED_CHEATING
        session.overall_score = 0
        session.passed = False
        session.ai_feedback_summary = "Your interview has been failed due to empty or insufficient responses. You must speak clearly and provide detailed answers."
        session.save()
        return True
        
    questions = session.questions.all().order_by('order')
    
    interview_data = []
    for q in questions:
        interview_data.append({
            "id": str(q.id),
            "question": q.question_text,
            "type": q.question_type,
            "transcript": q.answer_transcript or "[No Answer]",
            "words_per_minute": q.words_per_minute or 0,
            "time_to_answer_seconds": q.time_to_answer_seconds or 0
        })
        
    prompt = f"""
    You are an elite Senior Engineering Manager evaluating a candidate's recorded interview.
    You must score them strictly. 
    
    Evaluate the answers based on:
    1. Technical Accuracy (for technical questions).
    2. Communication & Confidence (for all questions). Note: 130-160 Words Per Minute (WPM) is a confident speaking rate. Very low WPM or extremely long time_to_answer_seconds indicates hesitation or searching for answers. High use of filler words in the transcript indicates low confidence.
    
    Interview Data:
    {json.dumps(interview_data)}
    
    Return a strict JSON object with this exact schema:
    {{
        "technical_score": <0-100 float>,
        "soft_skills_score": <0-100 float>,
        "overall_score": <0-100 float>,
        "feedback_summary": "<A 2-paragraph summary of their performance>",
        "question_evaluations": [
            {{
                "id": "<question_id>",
                "score": <0-100 float>,
                "feedback": "<1-2 sentence feedback on this specific answer>"
            }}
        ]
    }}
    """
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            logger.info(f"Attempting evaluation for session {session.id} (Attempt {attempt+1}/{max_retries})")
            result = generate_json(prompt, model_name="gemini-2.5-flash", temperature=0.1)
            
            # If result is empty dict due to fallback
            if not result:
                raise Exception("Empty result from LLM")
                
            session.technical_score = result.get('technical_score', 0)
            session.soft_skills_score = result.get('soft_skills_score', 0)
            session.overall_score = result.get('overall_score', 0)
            session.ai_feedback_summary = result.get('feedback_summary', '')
            
            has_critical_cheat = any("tab_switch" in flag or "blur" in flag for flag in session.cheat_flags)
            if session.overall_score >= 80 and not has_critical_cheat:
                session.passed = True
            
            session.status = AIInterviewSession.Status.COMPLETED
            session.completed_at = timezone.now()
            session.save()
            
            evals = result.get('question_evaluations', [])
            eval_dict = {e.get('id'): e for e in evals}
            
            for q in questions:
                q_eval = eval_dict.get(str(q.id))
                if q_eval:
                    q.ai_score = q_eval.get('score')
                    q.ai_feedback = q_eval.get('feedback')
                    q.save()
                    
            return True
        except Exception as e:
            logger.error(f"Failed to evaluate interview on attempt {attempt+1}: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt) # Exponential backoff: 1s, 2s
            else:
                logger.error("Max retries reached. Returning True for graceful degradation.")
                session.status = AIInterviewSession.Status.COMPLETED
                session.overall_score = 0
                session.passed = False
                session.ai_feedback_summary = "We could not evaluate your interview at this time because the AI servers are experiencing extreme high demand. Please contact support."
                session.save()
                return True
