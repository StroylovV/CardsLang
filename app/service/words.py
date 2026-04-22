from typing import List, Optional

from fastapi import Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.words import Word, Dictionary

class BaseDAO:
    def __init__(self, db: AsyncSession = Depends(get_db)):
        self.db = db

    def add_word(self):
        pass


    async def get_training_set(
    self, 
    dictionary_id: int, 
    limit: int
) -> List[Word]:
    
    query = (
        select(Word)
        .where(
            Word.dictionary_id == dictionary_id, 
            Word.is_studied == False
        )
        .order_by(func.random())
        .limit(limit)
    )
    
    result = await self.db.execute(query)
    
    return result.scalars().all()

