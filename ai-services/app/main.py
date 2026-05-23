"""
LifeOS AI — FastAPI Application
Main entry point for all ML services.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.models.model_registry import registry
from app.api.categorization_api import router as categorization_router
from app.api.anomaly_api import router as anomaly_router
from app.api.forecast_api import router as forecast_router
from app.api.agent_api import router as agent_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ML models at startup."""
    registry.load_all()
    yield
    print("Shutting down LifeOS AI services...")


app = FastAPI(
    title="LifeOS AI Services",
    description="ML-powered financial intelligence APIs — categorization, anomaly detection, forecasting",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(categorization_router)
app.include_router(anomaly_router)
app.include_router(forecast_router)
app.include_router(agent_router)

# Legacy endpoint (backward compatible)
from app.schemas.categorization_schema import TransactionRequest, CategorizationResponse
from app.services.categorization_service import predict_category

@app.post("/predict-category", response_model=CategorizationResponse, tags=["Legacy"])
def legacy_categorize(data: TransactionRequest):
    category, confidence = predict_category(data.description)
    return CategorizationResponse(category=category, confidence=confidence)


@app.get("/", tags=["Health"])
def root():
    return {
        "service": "LifeOS AI",
        "version": "2.0.0",
        "status": "running",
    }


@app.get("/health", tags=["Health"])
def health():
    return registry.health()