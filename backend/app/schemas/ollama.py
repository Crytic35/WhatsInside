from typing import List, Optional
from pydantic import BaseModel

class OllamaStatusResponse(BaseModel):
    connected: bool
    model: str
    available: bool
    status_text: str
    base_url: str
    installed_models: List[str] = []
    message: Optional[str] = None
