from typing import List, Optional

from fastapi import Depends
from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.words import Word, Dictionary
from app.models.user import User
from app.schemas.todo import DictionaryCreate
class DictionaryService:
    def __init__(self, db: AsyncSession = Depends(get_db)):
        self.db = db
    
    async def add_Dictionary(self, add_Dictionary: DictionaryCreate, user_id: int):
        stmt = (
            insert(Dictionary).values(**add_Dictionary.model_dump(), user_id=user_id).returning(Dictionary)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.scalar_one()
    #Показывать пользователю словарь по языку на главной странице.
    async def get_dictionaries_by_lang(self, user_id: int, lang: str) -> List[Dictionary]:
        query = select(Dictionary).where(
            Dictionary.lang == lang,
            Dictionary.user_id == user_id
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())
    #Показать пользователю все словари
    async def get_all_lang(self, user_id: int) -> List[Dictionary]:   
        query = select(Dictionary).where(Dictionary.user_id == user_id)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    #Получить словарь, если его нет - создаем
    async def get_or_create_dictionary(self, user_id: int, lang=str)->Dictionary:

        query = select(Dictionary).where(
            Dictionary.lang == lang, 
            Dictionary.user_id == user_id
        )
        result = await self.db.execute(query)
        dictionary = result.scalar_one_or_none()
        if dictionary is None:
            new_dict_data=DictionaryCreate(lang=lang)
            return await self.add_Dictionary(new_dict_data, user_id)
        return dictionary
    
