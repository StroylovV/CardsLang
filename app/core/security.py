from base64 import encode
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

JWT_COOKIE_KEY = "access_token"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(subject: str | Any, expires_delta: timedelta | None = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.security.jwt_expire_minutes
        )
    
    to_encode = {"exp": expire, "sub": str(subject)}
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.security.jwt_secret_key, 
        algorithm=settings.security.jwt_algorithm
    )
    return encoded_jwt

async def get_token_from_cookie(request: Request) -> str:
    token = request.cookies.get(JWT_COOKIE_KEY) 
    if not token:
        
        token_from_header = await oauth2_scheme(request)
        if not token_from_header:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Токен не найден в cookies или заголовках"
            )
        return token_from_header
    return token

async def get_current_user_id(
    request: Request,
    token_from_header: str | None = Depends(oauth2_scheme) 
) -> int:
    
    token = request.cookies.get(JWT_COOKIE_KEY)
    
    if not token:
        token = token_from_header

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Токен не найден. Пожалуйста, авторизуйтесь.", 
            headers={"WWW-Authenticate": "Bearer"},
        )

    if token.startswith("Bearer "):
        token = token.split(" ")[1]

    try:
        payload = jwt.decode(
            token, 
            settings.security.jwt_secret_key, 
            algorithms=[settings.security.jwt_algorithm]
        )
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid payload")
        return int(user_id)
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невалидный токен"
        )