"""Categorization API — FastAPI router."""
from fastapi import APIRouter, HTTPException
from app.schemas.categorization_schema import (
    TransactionRequest,
    CategorizationResponse,
    BatchTransactionRequest,
    BatchCategorizationResponse,
)
from app.services.categorization_service import predict_category, predict_batch
from app.models.model_registry import registry

router = APIRouter(prefix="/categorize", tags=["Categorization"])


@router.post("/predict", response_model=CategorizationResponse)
def categorize_transaction(data: TransactionRequest):
    """Predict category for a single transaction."""
    category, confidence = predict_category(data.description)
    return CategorizationResponse(category=category, confidence=confidence)


@router.post("/predict/batch", response_model=BatchCategorizationResponse)
def categorize_batch(data: BatchTransactionRequest):
    """Predict categories for multiple transactions."""
    results = predict_batch(data.descriptions)
    return BatchCategorizationResponse(
        results=[
            CategorizationResponse(category=cat, confidence=conf)
            for cat, conf in results
        ]
    )


@router.get("/metrics")
def get_metrics():
    """Get categorization model metrics."""
    metrics = registry.get_metrics("categorizer")
    if not metrics:
        raise HTTPException(status_code=404, detail="Model metrics not available. Train the model first.")
    return metrics