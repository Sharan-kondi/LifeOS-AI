from fastapi import APIRouter
from app.schemas.categorization_schema import (
    TransactionRequest,
    CategorizationResponse
)
from app.services.categorization_service import predict_category

router = APIRouter()

@router.post(
    "/predict-category",
    response_model=CategorizationResponse
)
def categorize_transaction(data: TransactionRequest):

    category = predict_category(data.description)

    return CategorizationResponse(category=category)