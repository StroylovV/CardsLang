from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user_id
from app.schemas import DictionaryCreate, DictionaryResponse, DictionaryUpdate
from app.service import DictionaryService

router = APIRouter()

@router.get("/all_language", response_model=List[DictionaryResponse])
async def get_all_lang(
    dictionary_service: DictionaryService = Depends(),
    current_user_id: int = Depends(get_current_user_id),
) -> Any:
    dictionaries = await dictionary_service.get_all_lang(current_user_id)
    if not dictionaries:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Словари не найдены") 
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

@router.patch("/{dictionary_id}", response_model=DictionaryResponse)
async def update_dictionary(
    dictionary_id: int,
    update_data: DictionaryUpdate,
    dictionary_service: DictionaryService = Depends(),
    current_user_id: int = Depends(get_current_user_id),
) -> Any:
    dictionary = await dictionary_service.get_dictionary_by_id(dictionary_id, current_user_id)

    if not dictionary:
        raise HTTPException(status_code=404, detail="Словарь не найден")
    
    if dictionary.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Нет доступа")

    updated_dictionary = await dictionary_service.update_dictionary(dictionary, update_data.description)
    return updated_dictionary

@router.post("/", response_model=DictionaryResponse, status_code=status.HTTP_201_CREATED)
async def new_Dictionary(
    add_dictionary: DictionaryCreate,
    dictionary_service: DictionaryService = Depends(),
    current_user_id: int = Depends(get_current_user_id),
) -> Any:
    dictionary = await dictionary_service.add_Dictionary(add_dictionary, current_user_id)
    return dictionary

@router.delete("/{dictionary_id}")
async def del_dict(
    dictionary_id: int,
    dictionary_service: DictionaryService = Depends(),
    current_user_id: int = Depends(get_current_user_id),
) -> Any:
    dictionary = await dictionary_service.get_dictionary_by_id(dictionary_id, current_user_id)

    if not dictionary:
        raise HTTPException(status_code=404, detail="Словарь не найден")
    
    if dictionary.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Нет доступа")

    await dictionary_service.delete(dictionary)
    return {"detail": "Словарь успешно удален"}