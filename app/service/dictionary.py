from typing import List, Optional

from fastapi import Depends
from sqlalchemy import func, insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.words import Word, Dictionary
from app.models.user import User
from app.schemas.todo import DictionaryCreate
class DictionaryService:
    def __init__(self, db: AsyncSession = Depends(get_db)):
        self.db = db
    #Создать новый словарь
    async def add_Dictionary(self, add_Dictionary: DictionaryCreate, user_id: int):
        stmt = (
            insert(Dictionary).values(**DictionaryCreate.model_dump(), user_id= user_id).returning(Dictionary)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result
    async def get_all_languages(self):
        pass
