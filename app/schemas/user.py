
from datetime import datetime
import email
from typing import Optional

from pydantic import BaseModel, Field, EmailStr

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)

class UserCreate(UserBase):
    email: EmailStr = Field(..., min_length=5)
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = Field(None, min_length=5)
    username: Optional[str] = Field(None, min_length=3, max_length=30)
    password: Optional[str] = Field(None, min_length=8)

class UserResponse(UserBase):
    id: int
    email: EmailStr
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes=True

class UserInfo(UserBase):
    ...
    class Config:
        from_attributes=True