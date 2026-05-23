"""Forecasting API — FastAPI router."""
from fastapi import APIRouter, HTTPException
from app.schemas.forecast_schema import (
    ForecastRequest,
    ForecastResponse,
    SavingsGoalRequest,
    SavingsGoalResponse,
)
from app.services.forecast_service import forecast_spending, calculate_savings_goal
from app.models.model_registry import registry

router = APIRouter(prefix="/forecast", tags=["Forecasting"])


@router.post("/spending", response_model=ForecastResponse)
def predict_spending(data: ForecastRequest):
    """Forecast daily spending for the next N days."""
    return forecast_spending(data.forecast_days, data.user_id)


@router.post("/savings-goal", response_model=SavingsGoalResponse)
def savings_goal(data: SavingsGoalRequest):
    """Calculate timeline to reach a savings goal."""
    return calculate_savings_goal(data)


@router.get("/metrics")
def get_metrics():
    """Get forecasting model metrics."""
    metrics = registry.get_metrics("forecast")
    if not metrics:
        raise HTTPException(status_code=404, detail="Forecast model metrics not available.")
    return metrics
