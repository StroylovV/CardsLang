from typing import List, Optional
from pydantic import BaseModel, Field

#Добавление одного слова
class Word_Create(BaseModel):
    word: str = Field(..., description="Слово на иностранном языке")
    translate: str = Field(..., description="Перевод")
    class Config:
        json_schema={
            "example": {
                "word": "Hello",
                "translate": "Привет",
            }
        }
#Получение слова
class Word_Response(Word_Create):
    id: int
    is_studied: bool = False
    dictionary_id: int
    class Config:
        from_attributes=True
        json_schema_extra = {
            "example": {
                "id": 1,
                "word": "hello",
                "translate": "Привет",
                "is_studied": False
            }
        }
class Word_Update(BaseModel):
    word: str = Field(None, description="Слово на иностранном языке")
    translate: str = Field(None, description="Перевод")
    studied: bool = None
#Создание словаря
class DictionaryCreate(BaseModel):
    lang: str = Field(..., description="Язык словаря", examples=["English"])
    description: Optional[str] = None
#Получение словаря
class DictionaryResponse(DictionaryCreate):
    id: int
    user_id: int
    length: int   
    description: Optional[str] = None
    class Config:
        from_attributes = True

class DictionaryUpdate(BaseModel):
    description: str = Field(None, description="Описание")

class BulkUpdateStudiedRequest(BaseModel):
    ids: List[int]
    is_studied: bool



