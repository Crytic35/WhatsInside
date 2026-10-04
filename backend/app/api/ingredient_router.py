from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.ingredient import IngredientDetailResponse, IngredientSchema
from backend.app.services.ingredient_service import ingredient_service

router = APIRouter(prefix="/ingredients", tags=["Ingredients"])

@router.get("/{name}", response_model=IngredientDetailResponse)
def get_ingredient_detail(name: str, db: Session = Depends(get_db)):
    """
    Look up authoritative ingredient record, evidence, concerns, and sources.
    If unknown, strictly outputs informational disclaimer without fabricating safety claims.
    """
    info = ingredient_service.lookup_ingredient_info(db, name)
    is_known = info.get("is_known_in_db", False)

    schema = IngredientSchema(
        canonical_name=info["canonical_name"],
        aliases=[],
        category=info["category"],
        functions=[info["function"]],
        common_uses=info["why_used"],
        known_concerns=info["potential_concern"],
        concern_level=info["concern_level"],
        evidence_level=info["evidence_level"],
        evidence_summary=info["evidence_summary"],
        exposure_notes="",
        regulatory_notes="",
        source_urls=info["sources"],
        unknown_info=info["unknown_info"],
        last_reviewed="2026-01-01"
    )

    return IngredientDetailResponse(
        found=is_known,
        ingredient=schema,
        query=name
    )
