from fastapi import FastAPI

from .routes import api_router


app = FastAPI(
    title="Smart Bus System API",
    version="0.1.0",
    description="Backend API for smart bus tracking and demand optimization.",
)


@app.get("/", tags=["Root"])
def read_root() -> dict[str, str]:
    return {"message": "Smart Bus System API is running"}


app.include_router(api_router)
