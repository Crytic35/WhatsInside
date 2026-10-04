from fastapi import APIRouter
from backend.app.schemas.ollama import OllamaStatusResponse
from backend.app.services.ollama_service import ollama_service

router = APIRouter(prefix="/ollama", tags=["Ollama"])

@router.get("/status", response_model=OllamaStatusResponse)
async def get_ollama_status():
    """
    Check if local Ollama daemon is running and whether Gemma 4:12B model is available.
    """
    return await ollama_service.check_status()
