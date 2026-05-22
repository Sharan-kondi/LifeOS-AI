from fastapi import FastAPI

from app.api.categorization_api import router as categorization_router

app = FastAPI()

app.include_router(categorization_router)

@app.get("/")
def root():
    return {
        "message": "LifeOS AI running successfully"
    }