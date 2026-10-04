from backend.app.schemas.ollama import OllamaStatusResponse
from backend.app.schemas.ingredient import IngredientSchema, IngredientDetailResponse
from backend.app.schemas.preference import UserPreferences, PreferenceUpdateResponse
from backend.app.schemas.analysis import (
    TextAnalysisRequest,
    AnalyzedIngredient,
    JustTellMeWhatMatters,
    ProductAnalysisResponse
)
from backend.app.schemas.comparison import (
    ProductComparisonRequest,
    ComparisonIngredientItem,
    ProductComparisonResponse
)

__all__ = [
    "OllamaStatusResponse",
    "IngredientSchema",
    "IngredientDetailResponse",
    "UserPreferences",
    "PreferenceUpdateResponse",
    "TextAnalysisRequest",
    "AnalyzedIngredient",
    "JustTellMeWhatMatters",
    "ProductAnalysisResponse",
    "ProductComparisonRequest",
    "ComparisonIngredientItem",
    "ProductComparisonResponse"
]
