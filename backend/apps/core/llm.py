import os
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

GEMINI_API_KEY = getattr(settings, 'GEMINI_API_KEY', os.environ.get('GEMINI_API_KEY'))

try:
    from google import genai
    from google.genai import types
    if GEMINI_API_KEY:
        client = genai.Client(api_key=GEMINI_API_KEY)
        HAS_GEMINI = True
    else:
        HAS_GEMINI = False
except ImportError:
    HAS_GEMINI = False

def generate_text(prompt: str, model_name: str = "gemini-flash-lite-latest", temperature: float = 0.7) -> str:
    """
    Generates text using Google Gemini.
    Returns fallback if API is unavailable or fails.
    """
    if not HAS_GEMINI:
        logger.warning("Gemini API not configured. Returning fallback text.")
        return "AI Generation is currently unavailable because the API key is not configured properly."

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(temperature=temperature)
        )
        return response.text
    except Exception as e:
        logger.error(f"Gemini API Error: {e}")
        return "An error occurred while generating the content. Please try again."

def generate_text_stream(prompt: str, model_name: str = "gemini-flash-lite-latest", temperature: float = 0.7):
    """
    Generates text using Google Gemini and yields it as a stream of chunks.
    Yields string chunks.
    """
    if not HAS_GEMINI:
        logger.warning("Gemini API not configured. Returning fallback text.")
        yield "AI Generation is currently unavailable because the API key is not configured properly."
        return

    try:
        response_stream = client.models.generate_content_stream(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(temperature=temperature)
        )
        for chunk in response_stream:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        logger.error(f"Gemini Streaming API Error: {e}")
        yield "\n\n[An error occurred while generating the rest of the content.]"
