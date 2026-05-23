from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Any
from app.agents.orchestrator import get_agent_response

router = APIRouter(prefix="/agent", tags=["Agent"])

class ChatRequest(BaseModel):
    query: str
    history: List[Any] = []
    user_id: str

@router.post("/chat")
def chat_with_agent(req: ChatRequest):
    response = get_agent_response(req.query, req.history, req.user_id)
    return {"answer": response}
