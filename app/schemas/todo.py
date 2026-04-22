from pydantic import BaseModel, Field, json_schema

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
class Word_Response(Word_Create):
    Id: int
    Studied: bool = False
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


class Dictionary(BaseModel):
    Lang: str = Field(..., description="Язык словаря")
    Len: int = Field(..., description="Количество слов в словаре")
    Studied: bool = False
    words: list[Word_Response] = []

class Dict_response(Dictionary):
    id: int
    lang: str
    length: int
    studied: bool
    
    class Config:
        from_attributes = True
