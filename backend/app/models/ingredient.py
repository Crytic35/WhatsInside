from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from backend.app.database import Base

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    canonical_name = Column(String(255), unique=True, index=True, nullable=False)
    aliases = Column(Text, default="[]")  # JSON list of lowercase alias strings
    category = Column(String(100), default="general", index=True)
    functions = Column(Text, default="[]")  # JSON list
    common_uses = Column(Text, default="")
    known_concerns = Column(Text, default="")
    concern_level = Column(String(50), default="LOW CONCERN")  # LOW CONCERN, MODERATE CONCERN, NEEDS ATTENTION, INSUFFICIENT INFORMATION
    evidence_level = Column(String(50), default="HIGH")  # HIGH, MEDIUM, LOW, UNKNOWN
    evidence_summary = Column(Text, default="")
    exposure_notes = Column(Text, default="")
    regulatory_notes = Column(Text, default="")
    source_urls = Column(Text, default="[]")  # JSON list
    unknown_info = Column(Text, default="Product-specific concentration is not provided on label.")
    last_reviewed = Column(String(50), default="2026-01-01")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
