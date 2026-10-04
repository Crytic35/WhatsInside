from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from backend.app.database import Base

class UserPreferenceRecord(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_identifier = Column(String(100), unique=True, default="default_user", index=True)
    flags = Column(Text, default="{}")  # JSON dict of boolean flags e.g. {"skin_irritation": true, ...}
    custom_avoidances = Column(Text, default="[]")  # JSON list of strings e.g. ["parabens", "fragrance"]
    notes = Column(Text, default="")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
