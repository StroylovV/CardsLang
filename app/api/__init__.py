from app.api.words import router as words_router
from fastapi import APIRouter

api_router = APIRouter(prefix="/api")

api_router.include_router(words_router, prefix="/words", tags=["words"])