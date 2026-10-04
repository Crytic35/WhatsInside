from typing import List, Optional
from pydantic import BaseModel, Field
from backend.app.schemas.analysis import ProductAnalysisResponse, AnalyzedIngredient

class ProductComparisonRequest(BaseModel):
    product_a_id: Optional[str] = None
    product_b_id: Optional[str] = None
    product_a_analysis: Optional[ProductAnalysisResponse] = None
    product_b_analysis: Optional[ProductAnalysisResponse] = None

class ComparisonIngredientItem(BaseModel):
    canonical_name: str
    in_product_a: bool
    in_product_b: bool
    function: str
    concern_level: str
    evidence_level: str
    preference_flag: Optional[str] = None

class ProductComparisonResponse(BaseModel):
    product_a_name: str
    product_b_name: str
    shared_ingredients: List[ComparisonIngredientItem] = Field(default_factory=list)
    product_a_unique: List[ComparisonIngredientItem] = Field(default_factory=list)
    product_b_unique: List[ComparisonIngredientItem] = Field(default_factory=list)
    preference_verdict: str
    preference_rationale: str
    safety_philosophy_reminder: str = "Differences reflect formulation goals and user preferences, not an absolute binary of safe vs toxic."
