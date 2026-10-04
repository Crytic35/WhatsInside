import json
import logging
from typing import List, Optional, Dict
from pathlib import Path
from backend.app.config import settings
from backend.app.schemas.analysis import (
    ProductAnalysisResponse,
    AnalyzedIngredient,
    JustTellMeWhatMatters
)

logger = logging.getLogger(__name__)

class DemoService:
    def __init__(self):
        self._demo_products: List[dict] = []
        self.load_demo_data()

    def load_demo_data(self):
        demo_path: Path = settings.DEMO_PRODUCTS_FILE
        if not demo_path.exists():
            logger.warning("Demo products file not found at %s", demo_path)
            return
        try:
            with open(demo_path, "r", encoding="utf-8") as f:
                self._demo_products = json.load(f)
            logger.info("Loaded %d demo products.", len(self._demo_products))
        except Exception as e:
            logger.error("Failed to load demo products: %s", e)

    def get_all_demo_products(self) -> List[dict]:
        if not self._demo_products:
            self.load_demo_data()
        return self._demo_products

    def get_demo_product_by_id(self, product_id: str) -> Optional[dict]:
        products = self.get_all_demo_products()
        for p in products:
            if p.get("id") == product_id:
                return p
        return None

    def match_demo_product(self, text_or_hint: str) -> dict:
        """
        Finds the closest demo product based on text keywords, or returns the first (shampoo).
        """
        products = self.get_all_demo_products()
        if not products:
            # Fallback inline if file is missing
            return {
                "id": "demo-shampoo",
                "product_name": "Clarifying Gentle Daily Shampoo",
                "category": "cosmetics",
                "subcategory": "Shampoo",
                "is_demo": True,
                "ingredients": []
            }

        lower = text_or_hint.lower()
        if any(w in lower for w in ["food", "chip", "corn", "snack", "eat", "flavor", "edible"]):
            for p in products:
                if p["id"] == "demo-food":
                    return p

        if any(w in lower for w in ["laundry", "detergent", "clean", "wash", "percarbonate", "pod"]):
            for p in products:
                if p["id"] == "demo-detergent":
                    return p

        if any(w in lower for w in ["serum", "niacinamide", "face", "moisturizer", "barrier"]):
            for p in products:
                if p["id"] == "demo-cosmetic":
                    return p

        if any(w in lower for w in ["spray", "bath", "kitchen", "surface", "degreaser"]):
            for p in products:
                if p["id"] == "demo-cleaner":
                    return p

        # Default to shampoo
        return products[0]

demo_service = DemoService()
