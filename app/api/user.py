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

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    user_service: UserService = Depends(),
    current_user_id: int = Depends(get_current_user_id), 
) -> Any:
    user = await user_service.get_user_id(current_user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден",
        )

    return user

@router.put("/me", response_model=UserResponse)
async def user_update(
    user_in: UserUpdate,
    user_service: UserService = Depends(),
    current_user_id: int = Depends(get_current_user_id),
)->Any:
    user = await user_service.get_user_id(current_user_id) 

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден",
        )

    user = await user_service.Update(user, user_in)
    return user

@router.delete("/me")
async def delete_user(
    response: Response,
    user_service: UserService = Depends(),
    current_user_id: int = Depends(get_current_user_id),
)->Any:
    user = await user_service.get_user_id(current_user_id) 
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден",
        )
    response.delete_cookie(JWT_COOKIE_KEY)
    await user_service.Delete(user)
    return {"detail": "Пользователь успешно удален"}


