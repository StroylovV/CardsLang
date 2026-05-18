from datetime import datetime, timezone
from typing import TYPE_CHECKING, List

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pydantic import EmailStr
from app.db import Base

if TYPE_CHECKING:
    from app.models.words import Word, Dictionary

class User(Base):
    __tablename__="user"

    id : Mapped[int] = mapped_column(primary_key=True)
    email : Mapped[EmailStr] = mapped_column(String(50), unique=True, index=True, nullable=True)
    username : Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)
    updated_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)

    dicts : Mapped[List["Dictionary"]] = relationship(
        "Dictionary", back_populates="user", cascade="all, delete-orphan"
    )