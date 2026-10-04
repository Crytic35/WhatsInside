from typing import List, Dict
from pydantic import BaseModel, Field

class UserPreferences(BaseModel):
    # Core boolean concern toggles
    skin_irritation: bool = False
    fragrance: bool = False
    allergens: bool = False
    food_additives: bool = False
    environmental_impact: bool = False
    children_exposure: bool = False
    general_information: bool = True
    
    # Custom ingredient avoidances (e.g., ["parabens", "sulfates", "msg"])
    custom_avoidances: List[str] = Field(default_factory=list)
    notes: str = ""

class PreferenceUpdateResponse(BaseModel):
    success: bool
    preferences: UserPreferences
    message: str = "Preferences updated successfully"
