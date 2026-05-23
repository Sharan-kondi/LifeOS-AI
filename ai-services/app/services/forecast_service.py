"""Forecasting service — prediction logic."""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from pathlib import Path
from app.models.model_registry import registry
from app.schemas.forecast_schema import (
    DailyForecast,
    ForecastResponse,
    SavingsGoalRequest,
    SavingsGoalResponse,
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
TX_PATH = BASE_DIR / "datasets" / "exports" / "transactions.csv"


def forecast_spending(forecast_days: int = 30, user_id: Optional[str] = None) -> ForecastResponse:
    """Forecast future daily spending using Prophet."""
    prophet_model = registry.get("prophet")

    if user_id:
        try:
            df = pd.read_csv(TX_PATH)
            df = df[df["user_id"] == user_id]
            
            if len(df) > 0:
                df["date"] = pd.to_datetime(df["timestamp"]).dt.date
                daily = df.groupby("date")["amount"].sum().reset_index()
                daily.columns = ["ds", "y"]
                daily["ds"] = pd.to_datetime(daily["ds"])
                daily = daily.sort_values("ds").reset_index(drop=True)
                
                if len(daily) >= 5:
                    from prophet import Prophet
                    prophet_model = Prophet(
                        yearly_seasonality=False,
                        weekly_seasonality=True,
                        daily_seasonality=False,
                        changepoint_prior_scale=0.1,
                        seasonality_prior_scale=10.0,
                    )
                    prophet_model.add_seasonality(name="monthly", period=30.5, fourier_order=5)
                    prophet_model.fit(daily)
                else:
                    return _fallback_forecast(forecast_days)
            else:
                return _fallback_forecast(forecast_days)
        except Exception:
            pass

    if prophet_model is None:
        return _fallback_forecast(forecast_days)

    # Prophet prediction
    future = prophet_model.make_future_dataframe(periods=forecast_days)
    forecast = prophet_model.predict(future)

    # Get only future predictions
    predictions = forecast.tail(forecast_days)

    daily_forecasts = []
    for _, row in predictions.iterrows():
        daily_forecasts.append(DailyForecast(
            date=row["ds"].strftime("%Y-%m-%d"),
            predicted_amount=round(max(float(row["yhat"]), 0), 2),
            lower_bound=round(max(float(row["yhat_lower"]), 0), 2),
            upper_bound=round(max(float(row["yhat_upper"]), 0), 2),
        ))

    total = sum(d.predicted_amount for d in daily_forecasts)
    avg = total / len(daily_forecasts) if daily_forecasts else 0

    # Determine trend
    if len(daily_forecasts) >= 7:
        first_week = sum(d.predicted_amount for d in daily_forecasts[:7])
        last_week = sum(d.predicted_amount for d in daily_forecasts[-7:])
        if last_week > first_week * 1.05:
            trend = "increasing"
        elif last_week < first_week * 0.95:
            trend = "decreasing"
        else:
            trend = "stable"
    else:
        trend = "stable"

    return ForecastResponse(
        predictions=daily_forecasts,
        total_predicted=round(total, 2),
        avg_daily=round(avg, 2),
        trend=trend,
        model_used="Prophet",
    )


def calculate_savings_goal(request: SavingsGoalRequest) -> SavingsGoalResponse:
    """Calculate how long to reach a savings goal."""
    # Get average monthly spending from forecast
    forecast = forecast_spending(90, request.user_id)
    avg_daily = forecast.avg_daily
    avg_monthly_spending = avg_daily * 30

    remaining = request.target_amount - request.current_savings
    monthly_disposable = request.monthly_income - avg_monthly_spending

    if monthly_disposable <= 0:
        return SavingsGoalResponse(
            months_needed=0,
            monthly_saving_required=remaining,
            feasibility="not_feasible",
            projected_date="N/A",
            avg_monthly_spending=round(avg_monthly_spending, 2),
        )

    months_needed = int(np.ceil(remaining / monthly_disposable))
    monthly_saving_required = remaining / max(months_needed, 1)

    # Feasibility assessment
    saving_ratio = monthly_saving_required / request.monthly_income
    if saving_ratio < 0.15:
        feasibility = "easy"
    elif saving_ratio < 0.30:
        feasibility = "moderate"
    elif saving_ratio < 0.50:
        feasibility = "aggressive"
    else:
        feasibility = "not_feasible"

    projected_date = (
        datetime.now() + timedelta(days=months_needed * 30)
    ).strftime("%B %Y")

    return SavingsGoalResponse(
        months_needed=months_needed,
        monthly_saving_required=round(monthly_saving_required, 2),
        feasibility=feasibility,
        projected_date=projected_date,
        avg_monthly_spending=round(avg_monthly_spending, 2),
    )


def _fallback_forecast(forecast_days: int) -> ForecastResponse:
    """Fallback when no model is available."""
    daily_forecasts = []
    today = datetime.now()
    for i in range(forecast_days):
        date = today + timedelta(days=i + 1)
        # Random baseline
        amount = round(np.random.uniform(5000, 25000), 2)
        daily_forecasts.append(DailyForecast(
            date=date.strftime("%Y-%m-%d"),
            predicted_amount=amount,
            lower_bound=round(amount * 0.7, 2),
            upper_bound=round(amount * 1.3, 2),
        ))

    total = sum(d.predicted_amount for d in daily_forecasts)
    return ForecastResponse(
        predictions=daily_forecasts,
        total_predicted=round(total, 2),
        avg_daily=round(total / forecast_days, 2),
        trend="stable",
        model_used="Fallback (no trained model)",
    )
