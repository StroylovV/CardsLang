from typing import List, Optional

from fastapi import Depends
from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import get_db
from app.models.words import Word, Dictionary
from app.models.user import User
from app.schemas.todo import DictionaryCreate
class DictionaryService:
    def __init__(self, db: AsyncSession = Depends(get_db)):
        self.db = db
    
    async def add_Dictionary(self, add_dictionary: DictionaryCreate, user_id: int):
        stmt = (
            insert(Dictionary)
            .values(**add_dictionary.model_dump(), user_id=user_id)
            .returning(Dictionary)
        )
        result = await self.db.execute(stmt)
        new_dictionary = result.scalar_one()
        
        await self.db.commit()
        await self.db.refresh(new_dictionary, attribute_names=["words"])
    
        return new_dictionary

    async def get_dictionary_by_id(self, dictionary_id: int, user_id: int) -> Dictionary | None:
        """
        Находит конкретный словарь пользователя по его ID.
        """
        query = (
            select(Dictionary)
            .where(
                Dictionary.id == dictionary_id,
                Dictionary.user_id == user_id
            )
            # Если тебе нужно сразу подгружать слова, оставь эту строку
            .options(selectinload(Dictionary.words)) 
        )
        
        result = await self.db.execute(query)
        # Возвращает объект или None, если ничего не найдено
        return result.scalar_one_or_none()
    
    #Показывать пользователю словарь по языку на главной странице.
    async def get_or_create_dictionary(self, user_id: int, lang: str) -> Dictionary:
        query = (
            select(Dictionary)
            .where(
                Dictionary.lang == lang,
                Dictionary.user_id == user_id
            )
            .options(selectinload(Dictionary.words)) 
        )
        result = await self.db.execute(query)
        dictionary = result.scalar_one_or_none()

        if dictionary:
            return dictionary
        stmt = (
            insert(Dictionary)
            .values(lang=lang, user_id=user_id)
            .returning(Dictionary)
        )
        result = await self.db.execute(stmt)
        new_dict = result.scalar_one()
        
        await self.db.commit()
        await self.db.refresh(new_dict, attribute_names=["words"])
        
        return new_dict
    async def get_all_lang(self, user_id: int) -> List[Dictionary]:   
        query = (
            select(Dictionary)
            .where(Dictionary.user_id == user_id)
            .options(selectinload(Dictionary.words)) 
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def delete(self, dictionary: Dictionary) -> None:
        await self.db.delete(dictionary)
        await self.db.commit()

    
