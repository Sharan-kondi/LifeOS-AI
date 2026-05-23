"""Pydantic schemas for anomaly detection API."""
from pydantic import BaseModel
from typing import List, Optional, Dict


class AnomalyRequest(BaseModel):
    amount: float
    category: str
    merchant: str
    payment_method: str
    hour: int = 12
    day_of_week: int = 0
    is_weekend: bool = False
    is_night: bool = False
    user_mean_amount: float = 0
    user_std_amount: float = 1
    user_median_amount: float = 0


class AnomalyResult(BaseModel):
    is_anomaly: bool
    anomaly_score: float
    isolation_forest_score: float
    autoencoder_score: float
    explanation: str


class BatchAnomalyRequest(BaseModel):
    transactions: List[AnomalyRequest]


class BatchAnomalyResponse(BaseModel):
    results: List[AnomalyResult]
    anomaly_count: int
    total: int


class AnomalyModelMetrics(BaseModel):
    isolation_forest: Dict
    autoencoder: Dict
    ensemble: Dict
    dataset: Dict
