"""Anomaly Detection API — FastAPI router."""
from fastapi import APIRouter, HTTPException
from app.schemas.anomaly_schema import (
    AnomalyRequest,
    AnomalyResult,
    BatchAnomalyRequest,
    BatchAnomalyResponse,
)
from app.services.anomaly_service import detect_anomaly, detect_batch
from app.models.model_registry import registry

router = APIRouter(prefix="/anomaly", tags=["Anomaly Detection"])


@router.post("/detect", response_model=AnomalyResult)
def detect_single(data: AnomalyRequest):
    """Detect if a single transaction is anomalous."""
    return detect_anomaly(data)


@router.post("/detect/batch", response_model=BatchAnomalyResponse)
def detect_anomalies_batch(data: BatchAnomalyRequest):
    """Detect anomalies in a batch of transactions."""
    results = detect_batch(data.transactions)
    anomaly_count = sum(1 for r in results if r.is_anomaly)
    return BatchAnomalyResponse(
        results=results,
        anomaly_count=anomaly_count,
        total=len(results),
    )


@router.get("/metrics")
def get_metrics():
    """Get anomaly detection model metrics."""
    metrics = registry.get_metrics("anomaly")
    if not metrics:
        raise HTTPException(status_code=404, detail="Anomaly model metrics not available.")
    return metrics
