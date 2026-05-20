from typing import List, Optional
from fastapi import Depends
from sqlalchemy import delete, func, insert, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import get_db
from app.models.words import Word, Dictionary
from app.schemas.todo import Word_Create, Word_Response

class WordService:
    def __init__(self, db: AsyncSession = Depends(get_db)):
        self.db = db

    async def add_word(self, word_add: Word_Create, dictionary_id: int, status: bool = False) -> Word:
        stmt = (
            insert(Word).values(**word_add.model_dump(),
            dictionary_id=dictionary_id, is_studied=status).returning(Word)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.scalar_one()

    async def get_word_by_id(self, word_id: int) -> Optional[Word]:
        query = (
            select(Word)
            .where(Word.id == word_id)
            .options(selectinload(Word.dictionary)) 
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def delete(self, word: Word) -> None:
        await self.db.delete(word)
        await self.db.commit()

    async def get_word_by_studied(self, dictionary_id: int, is_studied: bool) -> List[Word]:
        query = select(Word).where(
            Word.dictionary_id == dictionary_id,
            Word.is_studied == is_studied,
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def mark_as_studied(self, word: Word, status: bool) -> Word:
        word.is_studied = status 
        await self.db.commit()
        await self.db.refresh(word)
        return word

    async def clear_language_dictionary(self, dictionary_id: int) -> None:
        statement = delete(Word).where(Word.dictionary_id == dictionary_id)
        await self.db.execute(statement)
        await self.db.commit()

    async def get_training_set(self, count: int, dictionary_id: int) -> List[Word]:
        query = (
            select(Word).where(Word.dictionary_id == dictionary_id,
            Word.is_studied == False,
            ).order_by(func.random()).limit(count)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def bulk_mark_as_studied(self, word_ids:List[int], status: bool)->int:
        stmt = (
            update(Word).where(Word.id.in_(word_ids)).values(is_studied=status)
        )
        res = await self.db.execute(stmt)
        await self.db.commit()
        return res.rowcount

    async def get_words_by_ids(self, dictionary_id: int, word_ids: List[int])->List[Word]:
        query = (
            select(Word).where(Word.dictionary_id == dictionary_id, Word.id.in_(word_ids))
        )
        res = await self.db.execute(query)
        return list(res.scalars().all())        

    async def get_all_dictionaries(self, user_id: int):
        query = (
            select(
                Dictionary,
                func.count(Word.id).label("total"),
                func.count(Word.id).filter(Word.is_studied == True).label("studied"),
                func.count(Word.id).filter(Word.is_studied == False).label("remaining")
            )
            .outerjoin(Word, Dictionary.id == Word.dictionary_id)
            .where(Dictionary.user_id == user_id)
            .group_by(Dictionary.id)
        )
        
        result = await self.db.execute(query)
        all_rows = result.all()
        
        return [
            {
                "id": row.Dictionary.id,
                "title": row.Dictionary.lang, 
                "language": row.Dictionary.lang,
                "description": row.Dictionary.description,
                "total_count": row.total,
                "studied_count": row.studied,
                "unstudied_count": row.remaining
            }
            for row in all_rows
        ]