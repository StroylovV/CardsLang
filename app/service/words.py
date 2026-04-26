from typing import List

from fastapi import Depends
from sqlalchemy import delete, func, insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.words import Word, Dictionary
from app.schemas.todo import Word_Create, Word_Response

class WordService:
    def __init__(self, db: AsyncSession = Depends(get_db)):
        self.db = db
    #Добавляем слово
    async def add_word(self, word_add: Word_Create, dictionary_id: int, status: False) -> Word:
        stmt = (
            insert(Word).values(**word_add.model_dump(),
            dictionary_id=dictionary_id, is_studied=status).returning(Word)

        )
        
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result
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
    async def mark_as_studied(self, word: Word, status: bool) -> Word:
        await Word.is_studied=status
        await self.db.commit()
        await self.db.refresh(word)
        return word
    #Удалить все слова конкретного языка.
    async def clear_language_dictionary(self, dictionary_id: int) -> None:
        statement = delete(Word).where(Word.dictionary_id==dictionary_id)
        await self.db.execute(statement)
        await self.db.commit()

    #Метод для запуска сессии
    async def get_training_set(self, count: int, dictionary_id: int) -> List[Word]:
        
        query=(
            select(Word).where(Word.dictionary_id==dictionary_id,
            Word.is_studied==False,
            ).order_by(func.random()).limit(count)
        )
        result = await self.db.execute(query)
        return result.scalars().all()
    


        
    
