from pydantic import BaseModel

class TransactionRequest(BaseModel):
    description: str

class CategorizationResponse(BaseModel):
    category: str