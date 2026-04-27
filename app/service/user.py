from typing import List, Optional

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
    
    async def get_user_id(self, user_id: int) -> Optional[User]:
        # ИСПРАВЛЕНО: добавлен .scalar_one_or_none(), чтобы вернуть объект, а не итератор
        result = await self.db.execute(select(User).filter(User.id == user_id))
        return result.scalar_one_or_none()
    
    async def get_by_username(self, username: str) -> Optional[User]:
        # ИСПРАВЛЕНО: добавлен .scalar_one_or_none()
        result = await self.db.execute(select(User).filter(User.username == username))
        return result.scalar_one_or_none()
    
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
        await self.db.refresh(user)
        return user
    
    async def Delete(self, user: User) -> None:
        await self.db.delete(user)
        await self.db.commit()
    
    async def Auth(self, username: str, password: str) ->List[User]:
        result = await self.db.execute(select(User).where(User.username == username))
        user = result.scalar_one_or_none()

        if not user or not verify_password(password, user.hashed_password):
            return None
            
        return user

