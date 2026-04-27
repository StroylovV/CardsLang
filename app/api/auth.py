from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.security import JWT_COOKIE_KEY, create_access_token
from app.schemas import Token
from app.service import UserService


router = APIRouter()

@router.post("/login", response_model=Token)
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    user_service: UserService = Depends()
) ->Any:
    user = await user_service.Auth(form_data.username, form_data.password)

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверное имя пользователя или пароль")
    
    access_token = create_access_token(subject=user.id)
    response.set_cookie(JWT_COOKIE_KEY, access_token, httponly=True, samesite="none", secure=True)
    return {"access_token": access_token}

