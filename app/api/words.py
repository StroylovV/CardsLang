from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user_id
from app.schemas import Word_Create, Word_Response, DictionaryCreate, DictionaryResponse, Word_Update
from app.service import WordService, DictionaryService

router = APIRouter()

@router.get("/{dictionary_id}/words", response_model=List[Word_Response])
async def get_words_to_learn(
    dictionary_id: int,
    is_studied: bool,
    word_service: WordService = Depends(),
    current_user_id: int = Depends(get_current_user_id)
) -> Any:
    words = await word_service.get_word_by_studied(dictionary_id, is_studied)
    return words

@router.get("/{dictionary_id}/words/training", response_model=List[Word_Response])
async def get_training_set(
    dictionary_id: int,
    count: int,
    word_service: WordService = Depends(),
    current_user_id: int = Depends(get_current_user_id)
)->Any:
    words = await word_service.get_training_set(dictionary_id=dictionary_id, count=count)
    return words


@router.post("/{dictionary_id}/words", response_model=Word_Response, status_code=status.HTTP_201_CREATED)
async def new_word(
    dictionary_id: int,
    word_add: Word_Create, 
    word_service: WordService = Depends(),
    
    current_user_id: int = Depends(get_current_user_id)
) ->Any:
    word = await word_service.add_word(word_add, dictionary_id=dictionary_id)
    return word

@router.put("/{word_id}", response_model=Word_Response)
async def mark_as_studied(
    word_id: int,
    is_studied: bool,
    word_service: WordService = Depends(),
    current_user_id: int = Depends(get_current_user_id)
) -> Any:
    word = await word_service.get_word_by_id(word_id) 

    if not word:
        raise HTTPException(status_code=404, detail="Слово не найдено")
    if word.dictionary.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Нет доступа")

    return await word_service.mark_as_studied(word, is_studied)
@router.delete("/{word_id}")
async def delete_word(
    word_id: int,
    word_service: WordService = Depends(),
    current_user_id: int = Depends(get_current_user_id)
)->Any:
    word = await word_service.get_word_by_id(word_id)

    if not word:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Слово не найдено")
    if word.dictionary.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Нет доступа")
    
    await word_service.delete(word)
    return {"detail": "Заметка успешно удалена"}
    