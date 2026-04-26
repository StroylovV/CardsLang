from typing import List
from pydantic import BaseModel, Field, json_schema

#Добавление одного слова
class Word_Create(BaseModel):
    Word: str = Field(..., description="Слово на иностранном языке")
    Translate: str = Field(..., description="Перевод")
    class Config:
        json_schema={
            "example": {
                "Word": "Hello",
                "Translate": "Привет",
            }
        }
#Получение слова
class Word_Response(Word_Create):
    Id: int
    Studied: bool = False
    dictionary_id: int
    class Config:
        from_attributes=True
        json_schema={
            "example": {
                "id": 1,
                "word": "hello",
                "translate": "Привет",
                "studied": False
            }
        }

#Создание словаря
class DictionaryCreate(BaseModel):
    lang: str = Field(..., description="Язык словаря", examples=["English"])

#Получение словаря
class DictionaryResponse(DictionaryCreate):
    id: int
    user_id: int
    length: int 
    words: List[Word_Response] = []    
    class Config:
        from_attributes = True
