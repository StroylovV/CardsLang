from typing import List, Optional

from fastapi import Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import query

from app.db import get_db
from app.models.words import Word, Dictionary
from app.schemas.todo import Word_Create, Word_Response

class WordService:
    def __init__(self, db: AsyncSession = Depends(get_db)):
        self.db = db
    #Добавляем слово
    async def add_word(self, word_add: Word_Create, dictionary_id: int) -> Word:
        new_word = Word(
            **word_add.model_dump(),
            dictionary_id=dictionary_id
        )
        self.db.add(new_word)
        await self.db.commit()
        await self.db.refresh(new_word)
        return new_word
    #Удаляем слово
    async def delete(self, word: Word) -> None:
        await self.db.delete(word)
        await self.db.commit()
    #Получием слова, изученные или не изученные
    async def get_word_by_studied(self,dictionary_id: int, is_studied: bool) -> List[Word]:
        query = select(Word).where(
            Word.dictionary_id==dictionary_id,
            Word.is_studied==is_studied,
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    #Меняем значение флага is_studied
    async def mark_as_studied(self, word: Word, status: True) -> Word:
        await Word.is_studied=status
        await self.db.commit()
        await self.db.refresh(word)
        return word
    
        
    
