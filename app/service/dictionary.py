from typing import List, Optional

from fastapi import Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.words import Word, Dictionary

class DictionaryService:
    def __init__(self, db: AsyncSession = Depends(get_db)):
        self.db = db

    def add_Dictionary(self):
        pass
    
