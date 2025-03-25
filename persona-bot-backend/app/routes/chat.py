from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.ai_service import AIService
from app.dependencies import get_krutrim_client, get_groq_client

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, Any]]
    extracted_data: Dict[str, Any]

class ChatResponse(BaseModel):
    response: str
    extractedData: Dict[str, Any]
    analysis: Dict[str, str]

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    krutrim=Depends(get_krutrim_client),
    groq=Depends(get_groq_client)
):
    try:
        ai_service = AIService(krutrim, groq)
        response, new_data, analysis = await ai_service.process_message(
            request.message,
            request.history,
            request.extracted_data
        )
        
        return {
            "response": response,
            "extractedData": new_data,
            "analysis": analysis or {}
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing message: {str(e)}"
        )