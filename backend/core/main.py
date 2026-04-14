from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import api_router


app = FastAPI(
    title="Smart Bus System API",
    version="0.1.0",
    description="Backend API for smart bus tracking and demand optimization.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
def read_root() -> dict[str, str]:
    return {"message": "Smart Bus System API is running"}


app.include_router(api_router)
