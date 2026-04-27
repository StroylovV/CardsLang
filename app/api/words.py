from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user_id
from app.schemas import Word_Create, Word_Response, DictionaryCreate, DictionaryResponse
from app.service import WordService, DictionaryService

router = APIRouter()

@router.get("/", response_model=List[Word_Response])
async def get_words_to_learn(
    word_service : WordService = Depends(),
    is_studied: bool = Depends(),
    current_user_id: int = Depends(get_current_user_id)
) ->Any:
    words = await word_service.get_word_by_studied(current_user_id, is_studied)
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

@router.delete("/word")
def del_word():
    pass