
from datetime import datetime
from typing import List

from pydantic import BaseModel, Field

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    username: List[str] = Field(None, min_length=3, max_length=30)
    password: List[str] = Field(None, min_length=8)

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes=True

class UserInfo(UserBase):
    ...
    class Config:
        from_attributes=True