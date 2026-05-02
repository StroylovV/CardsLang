from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.api import api_router
import uvicorn
from app.db.base import create_tables
from contextlib import asynccontextmanager
from app.core.config import cors_config
@asynccontextmanager
async def lifespan(_: FastAPI):
    await create_tables()
    yield

app = FastAPI(title="Words API")



app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_config.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
