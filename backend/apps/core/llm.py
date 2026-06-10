import os
import logging
import json
from django.conf import settings
from pathlib import Path
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Force load .env from backend root just in case server wasn't restarted
backend_dir = Path(__file__).resolve().parent.parent.parent
load_dotenv(backend_dir / '.env', override=True)

GROQ_API_KEY = getattr(settings, 'GROQ_API_KEY', os.environ.get('GROQ_API_KEY'))
GEMINI_API_KEY = getattr(settings, 'GEMINI_API_KEY', os.environ.get('GEMINI_API_KEY'))

HAS_GROQ = False
groq_client = None

try:
    if GROQ_API_KEY:
        from groq import Groq
        groq_client = Groq(api_key=GROQ_API_KEY)
        HAS_GROQ = True
except ImportError:
    logger.error('Groq library not installed')

HAS_GEMINI = False
client = None

try:
    from google import genai
    from google.genai import types
    if GEMINI_API_KEY:
        client = genai.Client(api_key=GEMINI_API_KEY)
        # HAS_GEMINI = True # COMMENTED OUT TO FORCE GROQ USAGE IN FALLBACKS
        HAS_GEMINI = False
except ImportError:
    pass

def generate_text(prompt: str, model_name: str = 'llama-3.1-8b-instant', temperature: float = 0.7) -> str:
    if HAS_GROQ:
        try:
            response = groq_client.chat.completions.create(
                model=model_name,
                messages=[{'role': 'user', 'content': prompt}],
                temperature=temperature,
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f'Groq API Error: {e}')
            return 'An error occurred while generating the content. Please try again.'
    elif HAS_GEMINI:
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(temperature=temperature)
            )
            return response.text
        except Exception as e:
            logger.error(f'Gemini API Error: {e}')
            return 'An error occurred while generating the content. Please try again.'
    else:
        return 'AI Generation is currently unavailable because the API key is not configured properly.'

def generate_text_stream(prompt: str, model_name: str = 'llama-3.1-8b-instant', temperature: float = 0.7):
    if HAS_GROQ:
        try:
            stream = groq_client.chat.completions.create(
                model=model_name,
                messages=[{'role': 'user', 'content': prompt}],
                temperature=temperature,
                stream=True
            )
            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            logger.error(f'Groq Streaming API Error: {e}')
            yield '\n\n[An error occurred while generating the rest of the content.]'
    elif HAS_GEMINI:
        try:
            response_stream = client.models.generate_content_stream(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(temperature=temperature)
            )
            for chunk in response_stream:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            logger.error(f'Gemini Streaming API Error: {e}')
            yield '\n\n[An error occurred while generating the rest of the content.]'
    else:
        yield 'AI Generation is currently unavailable.'

def generate_json(prompt: str, model_name: str = 'llama-3.1-8b-instant', temperature: float = 0.2, max_tokens: int = 2000) -> dict:
    import re
    if HAS_GROQ:
        try:
            response = groq_client.chat.completions.create(
                model=model_name,
                messages=[{'role': 'user', 'content': prompt}],
                temperature=temperature,
                max_tokens=max_tokens
            )
            content = response.choices[0].message.content
            
            # Robust JSON extraction
            # 1. Try markdown block
            md_match = re.search(r'```(?:json)?\s*(\{[\s\S]*?\})\s*```', content)
            if md_match:
                return json.loads(md_match.group(1))
                
            # 2. Stack-based extraction for the FIRST complete JSON object
            start_idx = content.find('{')
            if start_idx != -1:
                stack = 0
                for i in range(start_idx, len(content)):
                    if content[i] == '{':
                        stack += 1
                    elif content[i] == '}':
                        stack -= 1
                        if stack == 0:
                            return json.loads(content[start_idx:i+1])
                            
            # 3. Fallback
            return json.loads(content)
        except Exception as e:
            logger.error(f'Groq API JSON Error: {e}')
            return {}
    elif HAS_GEMINI:
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=temperature,
                    response_mime_type='application/json'
                )
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f'Gemini API JSON Error: {e}')
            return {}
    return {}
