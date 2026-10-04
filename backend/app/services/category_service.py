import json
import logging
from typing import Dict, List, Optional
from pathlib import Path
from backend.app.config import settings

logger = logging.getLogger(__name__)

class CategoryService:
    def __init__(self):
        self.categories: Dict[str, dict] = {}
        self.load_categories()

    def load_categories(self):
        self.categories.clear()
        cat_dir: Path = settings.CATEGORIES_DIR
        if not cat_dir.exists():
            logger.warning("Category directory %s does not exist.", cat_dir)
            return

        for json_file in cat_dir.glob("*.json"):
            try:
                with open(json_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    cat_id = data.get("id", json_file.stem)
                    self.categories[cat_id] = data
            except Exception as e:
                logger.error("Failed to load category file %s: %s", json_file, e)

        logger.info("Loaded %d product categories.", len(self.categories))

    def get_all_categories(self) -> List[dict]:
        if not self.categories:
            self.load_categories()
        return list(self.categories.values())

    def get_category_by_id(self, cat_id: str) -> Optional[dict]:
        return self.categories.get(cat_id)

    def classify_text(self, text: str) -> dict:
        """
        Classifies product category based on keyword density and subcategory heuristics
        when AI classification needs confirmation or local fallback.
        """
        lower = text.lower()
        best_cat_id = "cosmetics"
        best_score = 0
        best_subcategory = "General"

        for cat_id, cat_data in self.categories.items():
            score = 0
            # Check subcategories
            for sub in cat_data.get("subcategories", []):
                if sub.lower() in lower:
                    score += 5
                    best_subcategory = sub

            # Check keywords
            for kw in cat_data.get("keywords", []):
                if kw.lower() in lower:
                    score += 2

            if score > best_score:
                best_score = score
                best_cat_id = cat_id

        cat_info = self.categories.get(best_cat_id, {
            "id": best_cat_id,
            "name": best_cat_id.replace("_", " ").title(),
            "regulatory_framework": "Standard Consumer Safety Guidelines"
        })

        return {
            "category_id": best_cat_id,
            "category_name": cat_info.get("name", best_cat_id),
            "subcategory": best_subcategory if best_score > 0 else (cat_info.get("subcategories", ["General"])[0]),
            "regulatory_framework": cat_info.get("regulatory_framework", "")
        }

category_service = CategoryService()
