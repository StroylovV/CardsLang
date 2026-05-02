from typing import List, TYPE_CHECKING
from sqlalchemy import String, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User

class Word(Base):
    __tablename__ = "words" 

    id: Mapped[int] = mapped_column(primary_key=True)
    word: Mapped[str] = mapped_column(String(255), nullable=False)
    translate: Mapped[str] = mapped_column(String(255), nullable=False)
    is_studied: Mapped[bool] = mapped_column(Boolean, default=False)

    
    dictionary_id: Mapped[int] = mapped_column(
        ForeignKey("dictionary.id", ondelete="CASCADE")
    )
    
    
    dictionary: Mapped["Dictionary"] = relationship(back_populates="words")


class Dictionary(Base):
    __tablename__ = "dictionary"

    id: Mapped[int] = mapped_column(primary_key=True)
    lang: Mapped[str] = mapped_column(String(90), nullable=False)

    
    words: Mapped[List["Word"]] = relationship(
        back_populates="dictionary", 
        cascade="all, delete-orphan"
    )
    
    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"), 
        nullable=False
    )
    user: Mapped["User"] = relationship(back_populates="dicts")

    @property
    def length(self) -> int:
        return len(self.words)