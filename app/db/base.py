from typing import AsyncGenerator
from sqlalchemy.orm import DeclarativeBase, declarative_base
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.core.config import settings

engine = create_async_engine(
    settings.database.database_url,  
    echo=True,
    future=True
)

AsyncSessionMaker = async_sessionmaker(expire_on_commit=False, autoflush=False, autocommit=False, bind=engine)

class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionMaker() as session:
        try:
            yield session
        finally:
            await session.close()

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


