from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
import uvicorn

from app.api import api_router
from app.core.config import cors_config

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    
    FastAPICache.init(InMemoryBackend(), prefix="cache")
    yield
    
app = FastAPI(title="Words API", lifespan=lifespan)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://cards-lang.vercel.app", 
        "http://localhost:3000"          
    ],
    
    allow_origin_regex=r"https://.*\.vercel\.app", 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)