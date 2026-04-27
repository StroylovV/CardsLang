from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user_id
from app.schemas import Word_Create, Word_Response, DictionaryCreate, DictionaryResponse
from app.service import WordService, DictionaryService

router = APIRouter()

@router.post("/", response_model=DictionaryResponse, status_code=status.HTTP_201_CREATED)
async def new_Dictionary(
    add_dictionary: DictionaryCreate,
    dictionary_servis : DictionaryService=Depends(),
    current_user_id: int = Depends(get_current_user_id),
)->Any:
    dictionary = await dictionary_servis.add_Dictionary(add_dictionary, current_user_id)
    return dictionary

    