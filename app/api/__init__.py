from app.api.words import router as words_router
from app.api.dictionary import router as dictionary_router
from app.api.auth import router as auth_router
from app.api.user import router as user_router
from app.api.tts import router as tts_router
from app.api.import_from_files import router as file_router
from fastapi import APIRouter



api_router = APIRouter(prefix="/api")

# Теперь пути будут: /api/user, /api/auth, /api/words
api_router.include_router(user_router, prefix="/user", tags=["User"])
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(dictionary_router, prefix="/dictionary", tags=["Dictionary"])
api_router.include_router(words_router, prefix="/words", tags=["Words"])
api_router.include_router(tts_router, prefix="/tts_word", tags=["TTS Service"])
api_router.include_router(file_router, prefix="/files", tags=["Files service"])



