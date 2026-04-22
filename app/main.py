from fastapi import FastAPI
from pydantic import BaseModel
from app.api import api_router
import uvicorn
from app.db.base import create_tables
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(_: FastAPI):
    await create_tables()
    yield

app = FastAPI(title="Words API")



app.include_router(api_router)

 

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
