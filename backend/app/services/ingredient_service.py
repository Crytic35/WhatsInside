import re
import json
import logging
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from backend.app.models.ingredient import Ingredient
from backend.app.schemas.ingredient import IngredientSchema

logger = logging.getLogger(__name__)

class IngredientService:
    @staticmethod
    def clean_name(raw: str) -> str:
        # Strip trailing asterisks, parenthesis content that is just language or percentage, e.g. "Glycerin (Vegetable)" -> keep but normalize
        cleaned = re.sub(r'[\*\#]', '', raw).strip()
        # Remove leading list markers like "1.", "-", etc.
        cleaned = re.sub(r'^\s*[\d\.\-\•\*\>]+\s*', '', cleaned)
        return cleaned

    @staticmethod
    def get_by_name_or_alias(db: Session, query_name: str) -> Optional[Ingredient]:
        cleaned = query_name.strip().lower()
        if not cleaned:
            return None

        # 1. Exact match on canonical_name (case-insensitive)
        ing = db.query(Ingredient).filter(
            Ingredient.canonical_name.ilike(cleaned)
        ).first()
        if ing:
            return ing

        # 2. Check JSON aliases in SQLite
        # We query all or use like '%"query"%'
        escaped_query = f'"{cleaned}"'
        candidate = db.query(Ingredient).filter(
            Ingredient.aliases.like(f'%{cleaned}%')
        ).first()
        if candidate:
            try:
                alias_list = json.loads(candidate.aliases)
                if any(a.lower() == cleaned for a in alias_list):
                    return candidate
            except Exception:
                pass

        # 3. Partial / substring match for common compound names e.g. "Water / Aqua"
        if "/" in cleaned or "(" in cleaned:
            parts = re.split(r'[/()]', cleaned)
            for p in parts:
                p_clean = p.strip()
                if len(p_clean) > 2:
                    sub_match = db.query(Ingredient).filter(
                        Ingredient.canonical_name.ilike(p_clean)
                    ).first()
                    if sub_match:
                        return sub_match

        return None

    @classmethod
    def lookup_ingredient_info(cls, db: Session, raw_name: str, fallback_category: str = "general") -> dict:
        cleaned = cls.clean_name(raw_name)
        record = cls.get_by_name_or_alias(db, cleaned)

        if record:
            functions = []
            try:
                functions = json.loads(record.functions)
            except Exception:
                pass

            sources = []
            try:
                sources = json.loads(record.source_urls)
            except Exception:
                pass

            return {
                "name": raw_name,
                "canonical_name": record.canonical_name,
                "category": record.category,
                "function": functions[0] if functions else "Ingredient Component",
                "why_used": record.common_uses or f"Commonly used as {', '.join(functions) if functions else 'an additive'}.",
                "potential_concern": record.known_concerns or "No significant concerns reported in typical consumer usage concentrations.",
                "concern_level": record.concern_level or "LOW CONCERN",
                "evidence_level": record.evidence_level or "HIGH",
                "evidence_summary": record.evidence_summary or "",
                "unknown_info": record.unknown_info or "The ingredient list does not provide the concentration, so product-specific risk cannot be determined from the label alone.",
                "sources": sources,
                "is_known_in_db": True
            }
        else:
            # Strictly adhering to project philosophy for unknown ingredients
            return {
                "name": raw_name,
                "canonical_name": cleaned.title() if cleaned else raw_name,
                "category": fallback_category,
                "function": "Identified Ingredient",
                "why_used": "Present on product formulation label.",
                "potential_concern": "Ingredient identified, but evidence is not currently available in the local knowledge base.",
                "concern_level": "INSUFFICIENT INFORMATION",
                "evidence_level": "UNKNOWN",
                "evidence_summary": "No verified peer-reviewed toxicological monograph found in the local knowledge base for this exact ingredient moniker.",
                "unknown_info": "Specific chemical grade, concentration, and long-term exposure data for this product are unknown from the label alone.",
                "sources": [],
                "is_known_in_db": False
            }

ingredient_service = IngredientService()
