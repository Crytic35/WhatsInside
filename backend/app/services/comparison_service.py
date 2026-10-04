import logging
from typing import List, Dict, Set
from sqlalchemy.orm import Session
from backend.app.schemas.analysis import ProductAnalysisResponse, AnalyzedIngredient
from backend.app.schemas.comparison import (
    ComparisonIngredientItem,
    ProductComparisonResponse
)
from backend.app.services.preference_service import preference_service
from backend.app.schemas.preference import UserPreferences

logger = logging.getLogger(__name__)

class ComparisonService:
    @classmethod
    def compare_products(
        cls,
        db: Session,
        prod_a: ProductAnalysisResponse,
        prod_b: ProductAnalysisResponse
    ) -> ProductComparisonResponse:
        prefs: UserPreferences = preference_service.get_preferences(db)

        # Map by canonical name
        map_a: Dict[str, AnalyzedIngredient] = {ing.canonical_name.lower(): ing for ing in prod_a.ingredients}
        map_b: Dict[str, AnalyzedIngredient] = {ing.canonical_name.lower(): ing for ing in prod_b.ingredients}

        canon_a: Set[str] = set(map_a.keys())
        canon_b: Set[str] = set(map_b.keys())

        shared_keys = canon_a.intersection(canon_b)
        unique_a_keys = canon_a - canon_b
        unique_b_keys = canon_b - canon_a

        def make_comp_item(canon_key: str, in_a: bool, in_b: bool) -> ComparisonIngredientItem:
            source_ing = map_a.get(canon_key) if in_a else map_b.get(canon_key)
            pref_flag = ", ".join(source_ing.matched_preferences) if source_ing.matched_preferences else None
            return ComparisonIngredientItem(
                canonical_name=source_ing.canonical_name,
                in_product_a=in_a,
                in_product_b=in_b,
                function=source_ing.function,
                concern_level=source_ing.concern_level,
                evidence_level=source_ing.evidence_level,
                preference_flag=pref_flag
            )

        shared_items = [make_comp_item(k, True, True) for k in sorted(shared_keys)]
        unique_a_items = [make_comp_item(k, True, False) for k in sorted(unique_a_keys)]
        unique_b_items = [make_comp_item(k, False, True) for k in sorted(unique_b_keys)]

        # Preference scoring
        # Count flagged items in unique sets
        flags_a = [item for item in unique_a_items if item.preference_flag or item.concern_level in ["NEEDS ATTENTION", "MODERATE CONCERN"]]
        flags_b = [item for item in unique_b_items if item.preference_flag or item.concern_level in ["NEEDS ATTENTION", "MODERATE CONCERN"]]

        # Formulate non-judgmental verdict
        if len(flags_a) > len(flags_b):
            verdict = f"{prod_b.product_name} better matches your selected preferences."
            rationale = (
                f"{prod_a.product_name} contains {len(flags_a)} unique ingredients flagged under your concerns or elevated attention criteria "
                f"({', '.join([i.canonical_name for i in flags_a[:3]])}), whereas {prod_b.product_name} contains {len(flags_b)} such unique constituents."
            )
        elif len(flags_b) > len(flags_a):
            verdict = f"{prod_a.product_name} better matches your selected preferences."
            rationale = (
                f"{prod_b.product_name} contains {len(flags_b)} unique ingredients flagged under your concerns or elevated attention criteria "
                f"({', '.join([i.canonical_name for i in flags_b[:3]])}), whereas {prod_a.product_name} contains {len(flags_a)} such unique constituents."
            )
        else:
            verdict = "Both products have comparable alignment with your current preferences."
            rationale = (
                f"Both products share {len(shared_items)} key ingredients and show similar concern profiles relative to your active preference filters."
            )

        return ProductComparisonResponse(
            product_a_name=prod_a.product_name,
            product_b_name=prod_b.product_name,
            shared_ingredients=shared_items,
            product_a_unique=unique_a_items,
            product_b_unique=unique_b_items,
            preference_verdict=verdict,
            preference_rationale=rationale
        )

comparison_service = ComparisonService()
