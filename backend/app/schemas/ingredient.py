from typing import List, Optional
from pydantic import BaseModel

class IngredientSchema(BaseModel):
    canonical_name: str
    aliases: List[str] = []
    category: str = "general"
    functions: List[str] = []
    common_uses: str = ""
    known_concerns: str = ""
    concern_level: str = "LOW CONCERN"  # LOW CONCERN, MODERATE CONCERN, NEEDS ATTENTION, INSUFFICIENT INFORMATION
    evidence_level: str = "HIGH"        # HIGH, MEDIUM, LOW, UNKNOWN
    evidence_summary: str = ""
    exposure_notes: str = ""
    regulatory_notes: str = ""
    source_urls: List[str] = []
    unknown_info: str = "Product-specific concentration is not provided on label."
    last_reviewed: str = "2026-01-01"

class IngredientDetailResponse(BaseModel):
    found: bool
    ingredient: Optional[IngredientSchema] = None
    query: str
    disclaimer: str = "Informational only. Hazard notes reflect known properties of the ingredient, not necessarily calculated risk in this specific finished product."
