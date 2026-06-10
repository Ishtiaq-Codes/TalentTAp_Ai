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
    You are an elite Hiring Manager and HR Director. 
    You are interviewing a candidate for a position.
    
    Candidate Context:
    {resume_context}
    
    Job Context:
    {job_context}
    
    Generate exactly 10 interview questions tailored STRICTLY to the candidate's actual profile, skills, and field.
    
    CRITICAL DIFFICULTY CALIBRATION:
    - You MUST look at their "Experience" (years). Calibrate the difficulty of your questions accordingly:
      * Fresher/Junior (0-2 years): Ask fundamental concepts, basic tool usage, and simple academic/entry-level scenarios. DO NOT ask deep architectural questions.
      * Mid-Level (3-5 years): Ask practical problem-solving, execution, and intermediate scenario-based questions.
      * Senior/Expert (6+ years): Ask deep, complex architectural, strategic, and high-level leadership scenarios.
      
    - If the candidate's profile indicates a specific field (e.g., Marketing, HR, Design, Business, Engineering), ask domain-specific questions relevant ONLY to their field.
    - If their field is completely unknown or empty, ask general professional, problem-solving, and situational questions.
    - DO NOT ask software engineering or coding questions UNLESS the candidate's profile or job explicitly indicates they are in software/tech.
    
    - 7 should be 'technical':
      * At least 3 of these technical questions MUST test Core Fundamentals of their field (e.g., for Software Engineers: OOP, DSA, Databases. For Designers: Color theory, UX principles. For SEO: Indexing, ranking factors). Core fundamentals must be tested for ALL experience levels, but scale the depth of the fundamental question based on their experience.
      * The remaining technical questions should test specific hard skills, tools, or professional scenarios tailored to their experience level.
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
            result = generate_json(prompt, model_name="llama-3.1-8b-instant", temperature=0.7)
            
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
    if total_words < 150:
        logger.warning(f"Candidate {session.candidate.user.email} submitted extremely short answers. Total words: {total_words}")
        session.status = AIInterviewSession.Status.FAILED_CHEATING
        session.overall_score = 0
        session.passed = False
        session.ai_feedback_summary = "Your interview has been failed due to extremely short or insufficient responses. A comprehensive interview requires detailed answers."
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
    You must score them extremely strictly.
    
    CRITICAL GRADING RULES:
    1. If the transcript for an answer is very short (e.g. under 15 words) or nonsensical, you MUST give a score of exactly 0 for that question. Do not give partial credit.
    2. If the answer does not accurately and comprehensively address the question, score it below 20%.
    3. Evaluate Technical Accuracy and Soft Skills rigorously. Filler words, hesitation, or lack of deep detail should severely lower the score.
    4. Note: 130-160 WPM is a confident speaking rate. Very low WPM or extremely long time_to_answer indicates hesitation.
    
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
            result = generate_json(prompt, model_name="llama-3.1-8b-instant", temperature=0.1)
            
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
