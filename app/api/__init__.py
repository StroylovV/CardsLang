from app.api.words import router as words_router
from app.api.dictionary import router as dictionary_router
from app.api.auth import router as auth_router
from app.api.user import router as user_router
from fastapi import APIRouter



api_router = APIRouter(prefix="/api")

# Теперь пути будут: /api/user, /api/auth, /api/words
api_router.include_router(user_router, prefix="/user", tags=["user"])
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(dictionary_router, prefix="/dictionary", tags=["dictionary"])
api_router.include_router(words_router, prefix="/words", tags=["words"]) # УБРАЛИ лишний /api здесь



