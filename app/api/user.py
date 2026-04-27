from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.security import JWT_COOKIE_KEY, get_current_user_id
from app.schemas import UserCreate, UserInfo, UserResponse, UserUpdate
from app.service import UserService

router = APIRouter()

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    user_service : UserService = Depends()
) ->Any:
    user = await user_service.Create(user_in)
    return user


