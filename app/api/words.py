from turtle import update
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.core.security import get_current_user_id
from app.schemas import Word_Create, Word_Response, Word_Update, BulkUpdateStudiedRequest
from app.service import WordService
from fastapi_cache import FastAPICache
from fastapi_cache.decorator import cache
from app.models import Word, Dictionary 

router = APIRouter()

@router.get("/{dictionary_id}/words", response_model=List[Word_Response])
async def get_words_to_learn(
    dictionary_id: int,
    is_studied: bool,
    word_service: WordService = Depends(),
    current_user_id: int = Depends(get_current_user_id)
) -> Any:
    return await word_service.get_word_by_studied(dictionary_id, is_studied)

@router.get("/{dictionary_id}/words/training", response_model=List[Word_Response])
async def get_training_set(
    dictionary_id: int,
    count: int,
    word_service: WordService = Depends(),
    current_user_id: int = Depends(get_current_user_id)
) -> Any:
    return await word_service.get_training_set(dictionary_id=dictionary_id, count=count)

@router.post("/{dictionary_id}/words", response_model=Word_Response, status_code=status.HTTP_201_CREATED)
async def new_word(
    dictionary_id: int,
    word_add: Word_Create, 
    word_service: WordService = Depends(),
    current_user_id: int = Depends(get_current_user_id)
) -> Any:
    await FastAPICache.clear(namespace="summary")
    return await word_service.add_word(word_add, dictionary_id=dictionary_id)

@router.get("/all_summary")
@cache(expire=60, namespace="summary")
async def get_language_summary(
    #dictionary_id: int,
    word_service: WordService = Depends(),
    current_user_id: int = Depends(get_current_user_id)
) -> Any:
    result = await word_service.get_all_dictionaries(current_user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Слова не найдены")
    return result

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
    await FastAPICache.clear(namespace="summary")
    return await word_service.mark_as_studied(word, is_studied)

@router.put("/bulk-study", status_code=status.HTTP_200_OK)
async def bulk_mark_as_studied(
    request: BulkUpdateStudiedRequest,
    word_service: WordService = Depends(),
    current_user_id: int = Depends(get_current_user_id)
)->Any:
    update_count = await word_service.bulk_mark_as_studied(request.ids, request.is_studied)
    await FastAPICache.clear(namespace="summary")
    return {"detail": f"Успешно обновлено слов: {update_count}"}

@router.get("/{dictionary_id}/training-batch", response_model=List[Word_Response])
async def get_training_batch(
    dictionary_id : int,
    ids: str = Query(..., description="ID слов через запятую, например: 1,2,3"),
    word_service: WordService = Depends(),
    current_user_id: int = Depends(get_current_user_id)
)->Any:
    try:
        id_list = [int(x.strip()) for x in ids.split(",") if x.strip().isdigit()]
    except ValueError:
        raise HTTPException(status_code=400, detail="Неверный формат ids")
    if not id_list:
        raise HTTPException(status_code=400, detail="Список ID пуст")

    return await word_service.get_words_by_ids(dictionary_id, id_list)

@router.delete("/{word_id}")
async def delete_word(
    word_id: int,
    word_service: WordService = Depends(),
    current_user_id: int = Depends(get_current_user_id)
) -> Any:
    word = await word_service.get_word_by_id(word_id)

    if not word:
        raise HTTPException(status_code=404, detail="Слово не найдено")
    
    if word.dictionary.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Нет доступа")
    
    await word_service.delete(word)
    await FastAPICache.clear(namespace="summary")
    return {"detail": "Слово успешно удалено"}

@router.delete("/{dictionary_id}/delete_all", status_code=status.HTTP_200_OK)
async def clear_language_dictionar(
    dictionary_id: int,
    word_service: WordService = Depends(),
    current_user_id: int = Depends(get_current_user_id)
) -> Any:
    await word_service.clear_language_dictionary(dictionary_id)
    await FastAPICache.clear(namespace="summary")
    return {"detail": "Словарь успешно очищен"}

