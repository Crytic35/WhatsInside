import uuid
import logging
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from backend.app.services.ollama_service import ollama_service
from backend.app.services.category_service import category_service
from backend.app.services.ingredient_service import ingredient_service
from backend.app.services.preference_service import preference_service
from backend.app.services.demo_service import demo_service
from backend.app.schemas.analysis import (
    ProductAnalysisResponse,
    AnalyzedIngredient,
    JustTellMeWhatMatters
)
from backend.app.schemas.preference import UserPreferences

logger = logging.getLogger(__name__)

class AnalysisService:
    @staticmethod
    def _build_just_tell_me_what_matters(
        category_name: str,
        ingredients: List[AnalyzedIngredient],
        preference_highlights: List[str]
    ) -> JustTellMeWhatMatters:
        # 1. What it does
        functions = [ing.function for ing in ingredients[:4] if ing.function]
        what_it_does = f"Acts as a formulated {category_name.lower()} combining {', '.join(functions[:3])}."

        # 2. Why it's there
        why_its_there = "Each ingredient serves a functional purpose—cleansing, preserving freshness, stabilizing the blend, or delivering active benefits."

        # 3. What I should care about
        elevated_concerns = [ing for ing in ingredients if ing.concern_level in ["NEEDS ATTENTION", "MODERATE CONCERN"]]
        if elevated_concerns:
            names = [ing.canonical_name for ing in elevated_concerns[:3]]
            what_i_should_care_about = (
                f"Pay attention to: {', '.join(names)}. "
                "These have documented sensitivities or usage considerations (e.g. potential skin dryness, allergen reactivity, or formulation limits)."
            )
        else:
            what_i_should_care_about = "The identified ingredients have well-established safety profiles at customary consumer exposure levels."

        if preference_highlights:
            what_i_should_care_about += f" User preference note: {preference_highlights[0]}"

        # 4. What we don't know
        what_we_dont_know = (
            "The ingredient list does not provide the concentration, "
            "so product-specific risk cannot be determined from the label alone. "
            "Actual skin reaction depends on individual tolerance and how long the product stays on skin."
        )

        return JustTellMeWhatMatters(
            what_it_does=what_it_does,
            why_its_there=why_its_there,
            what_i_should_care_about=what_i_should_care_about,
            what_we_dont_know=what_we_dont_know
        )

    @classmethod
    def process_extracted_data(
        cls,
        db: Session,
        extracted: dict,
        is_demo: bool = False,
        ai_model: str = "gemma4:12b"
    ) -> ProductAnalysisResponse:
        product_name = extracted.get("product_name") or "Consumer Product"
        raw_category = extracted.get("category", "")
        raw_text = extracted.get("raw_text", "")
        extracted_ingredients = extracted.get("ingredients", [])

        # Categorize
        if not raw_category or raw_category not in category_service.categories:
            classification = category_service.classify_text(f"{product_name} {raw_text}")
            cat_id = classification["category_id"]
            cat_name = classification["category_name"]
            subcategory = extracted.get("subcategory") or classification["subcategory"]
            reg_framework = classification["regulatory_framework"]
        else:
            cat_id = raw_category
            cat_info = category_service.get_category_by_id(cat_id) or {}
            cat_name = cat_info.get("name", cat_id.replace("_", " ").title())
            subcategory = extracted.get("subcategory") or (cat_info.get("subcategories", ["General"])[0])
            reg_framework = cat_info.get("regulatory_framework", "Consumer Safety Guidelines")

        # Fetch user preferences
        prefs: UserPreferences = preference_service.get_preferences(db)

        # Lookup & normalize each ingredient
        analyzed_ingredients: List[AnalyzedIngredient] = []
        all_preference_hits: List[str] = []

        for item in extracted_ingredients:
            # item can be a string or a dict
            if isinstance(item, dict):
                raw_name = item.get("name", "") or item.get("canonical_name", "")
            else:
                raw_name = str(item)

            if not raw_name.strip():
                continue

            info = ingredient_service.lookup_ingredient_info(db, raw_name, fallback_category=cat_id)
            
            # Check user preferences
            matched_prefs = preference_service.match_ingredient_preferences(info, prefs)
            if matched_prefs:
                all_preference_hits.extend(matched_prefs)

            analyzed_ing = AnalyzedIngredient(
                name=info["name"],
                canonical_name=info["canonical_name"],
                category=info["category"],
                function=info["function"],
                why_used=info["why_used"],
                potential_concern=info["potential_concern"],
                concern_level=info["concern_level"],
                evidence_level=info["evidence_level"],
                evidence_summary=info["evidence_summary"],
                unknown_info=info["unknown_info"],
                sources=info["sources"],
                matched_preferences=matched_prefs,
                is_known_in_db=info["is_known_in_db"]
            )
            analyzed_ingredients.append(analyzed_ing)

        # Preference highlights summary
        preference_highlights = []
        unique_hits = list(dict.fromkeys(all_preference_hits))
        for hit in unique_hits:
            preference_highlights.append(f"Contains ingredients flagged for: {hit}")

        # Plain-language summary
        summary = extracted.get("summary")
        if not summary:
            summary = (
                f"{product_name} is formulated with {len(analyzed_ingredients)} declared ingredients. "
                "The core formula includes functional agents to cleanse, preserve, and condition. "
                "Safety profiles reflect known scientific data, though specific concentrations remain proprietary."
            )

        # Build "Just Tell Me What Matters"
        just_matters = cls._build_just_tell_me_what_matters(cat_name, analyzed_ingredients, preference_highlights)

        # Technical explanation
        technical_explanation = (
            f"Formulation categorized under {cat_name} ({subcategory}). "
            f"Governed by {reg_framework}. "
            "Individual chemical constituents were mapped to canonical toxicological entries. "
            "Toxicological hazard data must be contextualized: presence on the ingredient label signifies formulation inclusion, "
            "not systemic dosage or finished product toxicity. Exposure route, chemical barrier penetration, and matrix interactions "
            "determine real-world bioavailability."
        )

        return ProductAnalysisResponse(
            id=str(uuid.uuid4())[:8],
            product_name=product_name,
            category=cat_id,
            category_name=cat_name,
            subcategory=subcategory,
            raw_text=raw_text,
            is_demo=is_demo,
            ai_model_used=ai_model,
            what_should_i_know=summary,
            just_tell_me_what_matters=just_matters,
            technical_explanation=technical_explanation,
            ingredients=analyzed_ingredients,
            preference_highlights=preference_highlights,
            regulatory_context=reg_framework
        )

    @classmethod
    async def analyze_image(cls, db: Session, image_bytes: bytes, fallback_demo: bool = True) -> ProductAnalysisResponse:
        # Check Ollama status
        status = await ollama_service.check_status()
        
        if status.connected and status.available:
            logger.info("Running vision analysis using %s", status.model)
            ai_result = await ollama_service.analyze_label_image(image_bytes)
            if ai_result and ai_result.get("ingredients"):
                return cls.process_extracted_data(db, ai_result, is_demo=False, ai_model=status.model)
            else:
                logger.warning("Ollama vision returned empty or unparseable result.")
        else:
            logger.info("Ollama is offline or model unavailable (%s).", status.status_text)

        # Fallback to Demo Mode
        if fallback_demo:
            logger.info("Falling back to demo mode shampoo product.")
            demo_product = demo_service.get_demo_product_by_id("demo-shampoo") or demo_service.get_all_demo_products()[0]
            return cls.process_extracted_data(db, demo_product, is_demo=True, ai_model="Demo Data Mode")
        else:
            raise RuntimeError("Ollama local AI is unavailable and demo fallback was disabled.")

    @classmethod
    async def analyze_text(
        cls,
        db: Session,
        text: str,
        product_name: Optional[str] = None,
        fallback_demo: bool = True
    ) -> ProductAnalysisResponse:
        status = await ollama_service.check_status()

        if status.connected and status.available:
            logger.info("Running text analysis with %s", status.model)
            ai_result = await ollama_service.analyze_ingredient_text(text, product_name=product_name)
            if ai_result and ai_result.get("ingredients"):
                return cls.process_extracted_data(db, ai_result, is_demo=False, ai_model=status.model)

        # If Ollama is offline or parsing was incomplete, parse ingredients via heuristic splitter
        if text and len(text.strip()) > 3:
            # Split comma separated ingredients
            raw_items = [part.strip() for part in text.replace("\n", ",").split(",") if part.strip()]
            extracted = {
                "product_name": product_name or "Custom Product",
                "category": "",
                "raw_text": text,
                "ingredients": raw_items,
                "summary": f"Custom product formulation containing {len(raw_items)} listed ingredients."
            }
            return cls.process_extracted_data(db, extracted, is_demo=False, ai_model="Local Knowledge Parser")

        # Fallback to demo
        if fallback_demo:
            demo_product = demo_service.match_demo_product(text)
            return cls.process_extracted_data(db, demo_product, is_demo=True, ai_model="Demo Data Mode")

        raise ValueError("No valid ingredient text provided.")

analysis_service = AnalysisService()
