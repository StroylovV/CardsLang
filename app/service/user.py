from typing import List

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash, verify_password
from app.db import get_db
from app.models import User
from app.schemas import UserCreate, UserUpdate

class UserService:
    def __init__(self, db: AsyncSession = Depends(get_db)):
        self.db = db
    
    async def get_user_id(self, user_id: int) -> List[User]:
        result = await self.db.execute(select(User).filter(User.id == user_id))
        return result
    
    async def get_by_username(self, username: str) -> List[User]:
        result = await self.db.execute(select(User).filter(User.username == username))
        return result
    
    async def Create(self, user_in: UserCreate)-> User:
        user = User(
            username=user_in.username,
            hashed_password=get_password_hash(user_in.password),
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def Update(self, user: User, user_in: UserUpdate) -> User:
        if user_in.username is not None:
            user.username = user_in.username
        if user_in.password is not None:
            user.hashed_password = get_password_hash(user_in.password)
        
        await self.db.commit()
        await self.db.refresh(User)

        return User
    
    async def Delete(self, user: User) ->None:
        await self.db.delete(User)
        await self.db.commit()
    
    async def Auth(self, username: str, password: str) ->List[User]:
        user = await self.get_by_username(username)

        if not user or not verify_password(password, hashed_password):
            return None
            
        return user

