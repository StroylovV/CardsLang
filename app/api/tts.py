import io
import logging
from typing import Any
import edge_tts
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from app.core.security import get_current_user_id


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


VOICE_MAPPING = {
    "en": "en-US-GuyNeural",         # Английский
    "ru": "ru-RU-SvetlanaNeural",    # Русский
    "es": "es-ES-AlvaroNeural",      # Испанский
    "zh": "zh-CN-XiaoxiaoNeural",    # Китайский
    "de": "de-DE-KillianNeural",     # Немецкий
    "fr": "fr-FR-DeniseNeural",      # Французский
    "it": "it-IT-DiegoNeural",       # Итальянский
    "ja": "ja-JP-NanamiNeural",      # Японский
    "ko": "ko-KR-SunHiNeural",       # Корейский
}

@router.get("/app/voice/speak")
async def speak_word(
    text: str = Query(..., description="Текст слова или фразы для озвучки", min_length=1),
    lang: str = Query(..., description="Код языка из вашей БД (например: en, ru, zh, es)"),
    current_user_id: int = Depends(get_current_user_id)
)->Any:
    clean_lang = lang.lower().strip()

    voice = VOICE_MAPPING.get(clean_lang)
    if not voice:
        logger.warning(f'Попытка озвучить неподдержываемый язык {lang}')
        raise HTTPException(
            status_code=400,
            detail=f"Language code '{lang}' is not supported yet. Supported: {list(VOICE_MAPPING.keys())}"
        )
    try:
        communicate = edge_tts.Communicate(text, voice, rate="-20%")

        async def audio_stream_generator():
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    yield chunk["data"]
                    
        
        return StreamingResponse(
            audio_stream_generator(), 
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=\"speech.mp3\""
            }
        )
    except Exception as e:
        logger.error(f"Ошибка при генерации TTS для текста '{text}': {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during speech synthesis")