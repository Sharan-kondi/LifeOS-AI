"""Pydantic schemas for categorization API."""
from pydantic import BaseModel
from typing import List, Optional, Dict


class TransactionRequest(BaseModel):
    description: str


class CategorizationResponse(BaseModel):
    category: str
    confidence: float


class BatchTransactionRequest(BaseModel):
    descriptions: List[str]


class BatchCategorizationResponse(BaseModel):
    results: List[CategorizationResponse]


class ModelMetrics(BaseModel):
    model_type: str
    accuracy: float
    avg_confidence: float
    n_categories: int
    categories: List[str]
    macro_f1: float
    weighted_f1: float
    per_class: Optional[Dict] = None