from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.preference import UserPreferences, PreferenceUpdateResponse
from backend.app.services.preference_service import preference_service

router = APIRouter(prefix="/preferences", tags=["Preferences"])

@router.get("", response_model=UserPreferences)
def get_user_preferences(db: Session = Depends(get_db)):
    """
    Retrieve active user health/lifestyle preference flags and custom avoidance list.
    """
    return preference_service.get_preferences(db)

@router.put("", response_model=PreferenceUpdateResponse)
def update_user_preferences(prefs: UserPreferences, db: Session = Depends(get_db)):
    """
    Update user preferences for personalized formulation flagging.
    """
    saved = preference_service.save_preferences(db, prefs)
    return PreferenceUpdateResponse(
        success=True,
        preferences=saved,
        message="Preferences successfully stored"
    )
