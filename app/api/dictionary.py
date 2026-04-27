from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user_id
from app.schemas import Word_Create, Word_Response, DictionaryCreate, DictionaryResponse
from app.service import WordService, DictionaryService

router = APIRouter()

@router.get("/all_language", response_model=List[DictionaryResponse])
async def get_all_lang(
    dictionary_service : DictionaryService=Depends(),
    current_user_id: int = Depends(get_current_user_id),
) ->Any:
    dictionaries = await dictionary_service.get_all_lang(current_user_id)
    if not dictionaries:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND) 
    return dictionaries

@router.get("/{lang}/get_or_create", response_model=DictionaryResponse)
async def get_or_create_dictionary(
    lang: str,
    dictionary_service: DictionaryService = Depends(),
    current_user_id: int = Depends(get_current_user_id),
) -> Any:
    dictionary = await dictionary_service.get_or_create_dictionary(
        user_id=current_user_id, 
        lang=lang
    )
    return dictionary
@router.post("/", response_model=DictionaryResponse, status_code=status.HTTP_201_CREATED)
async def new_Dictionary(
    add_dictionary: DictionaryCreate,
    dictionary_service : DictionaryService=Depends(),
    current_user_id: int = Depends(get_current_user_id),
)->Any:
    dictionary = await dictionary_service.add_Dictionary(add_dictionary, current_user_id)
    return dictionary


    