from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class TextAnalysisRequest(BaseModel):
    text: str
    product_name: Optional[str] = None
    category_hint: Optional[str] = None
    use_demo_fallback: bool = True

class AnalyzedIngredient(BaseModel):
    name: str
    canonical_name: str
    category: str = "general"
    function: str = "Component"
    why_used: str = "Used in the formulation."
    potential_concern: str = "No notable adverse concerns identified at customary usage."
    concern_level: str = "LOW CONCERN"  # LOW CONCERN, MODERATE CONCERN, NEEDS ATTENTION, INSUFFICIENT INFORMATION
    evidence_level: str = "HIGH"        # HIGH, MEDIUM, LOW, UNKNOWN
    evidence_summary: str = ""
    unknown_info: str = "Product concentration is not provided on the label, so formulation-specific risk cannot be definitively determined."
    sources: List[str] = Field(default_factory=list)
    matched_preferences: List[str] = Field(default_factory=list)
    is_known_in_db: bool = True

class JustTellMeWhatMatters(BaseModel):
    what_it_does: str
    why_its_there: str
    what_i_should_care_about: str
    what_we_dont_know: str

class ProductAnalysisResponse(BaseModel):
    id: str
    product_name: str
    category: str
    category_name: str
    subcategory: str
    raw_text: str = ""
    is_demo: bool = False
    ai_model_used: str = "gemma4:12b"
    what_should_i_know: str
    just_tell_me_what_matters: JustTellMeWhatMatters
    technical_explanation: str
    ingredients: List[AnalyzedIngredient] = Field(default_factory=list)
    preference_highlights: List[str] = Field(default_factory=list)
    regulatory_context: str = ""
    limitations: str = "The ingredient list does not provide the concentration, so product-specific risk cannot be determined from the label alone."
    disclaimer: str = "Informational analysis based on available scientific evidence. Not medical or regulatory advice."
