"""Pydantic schemas for forecasting API."""
from pydantic import BaseModel
from typing import List, Optional, Dict


class ForecastRequest(BaseModel):
    forecast_days: int = 30
    user_id: Optional[str] = None


class DailyForecast(BaseModel):
    date: str
    predicted_amount: float
    lower_bound: float
    upper_bound: float


class ForecastResponse(BaseModel):
    predictions: List[DailyForecast]
    total_predicted: float
    avg_daily: float
    trend: str  # "increasing", "decreasing", "stable"
    model_used: str


class SavingsGoalRequest(BaseModel):
    target_amount: float
    monthly_income: float
    current_savings: float = 0
    user_id: Optional[str] = None


class SavingsGoalResponse(BaseModel):
    months_needed: int
    monthly_saving_required: float
    feasibility: str  # "easy", "moderate", "aggressive", "not_feasible"
    projected_date: str
    avg_monthly_spending: float


class ForecastModelMetrics(BaseModel):
    prophet: Dict
    lstm: Dict
    dataset: Dict
