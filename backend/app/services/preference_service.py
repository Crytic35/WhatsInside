import json
import logging
from typing import List, Tuple
from sqlalchemy.orm import Session
from backend.app.models.preference import UserPreferenceRecord
from backend.app.schemas.preference import UserPreferences

logger = logging.getLogger(__name__)

class PreferenceService:
    DEFAULT_USER_ID = "local_user"

    @classmethod
    def get_preferences(cls, db: Session) -> UserPreferences:
        record = db.query(UserPreferenceRecord).filter(
            UserPreferenceRecord.user_identifier == cls.DEFAULT_USER_ID
        ).first()

        if not record:
            return UserPreferences()

        try:
            flags = json.loads(record.flags) if record.flags else {}
            custom = json.loads(record.custom_avoidances) if record.custom_avoidances else []
            return UserPreferences(
                skin_irritation=flags.get("skin_irritation", False),
                fragrance=flags.get("fragrance", False),
                allergens=flags.get("allergens", False),
                food_additives=flags.get("food_additives", False),
                environmental_impact=flags.get("environmental_impact", False),
                children_exposure=flags.get("children_exposure", False),
                general_information=flags.get("general_information", True),
                custom_avoidances=custom,
                notes=record.notes or ""
            )
        except Exception as e:
            logger.error("Failed to parse user preferences: %s", e)
            return UserPreferences()

    @classmethod
    def save_preferences(cls, db: Session, prefs: UserPreferences) -> UserPreferences:
        record = db.query(UserPreferenceRecord).filter(
            UserPreferenceRecord.user_identifier == cls.DEFAULT_USER_ID
        ).first()

        flags_dict = {
            "skin_irritation": prefs.skin_irritation,
            "fragrance": prefs.fragrance,
            "allergens": prefs.allergens,
            "food_additives": prefs.food_additives,
            "environmental_impact": prefs.environmental_impact,
            "children_exposure": prefs.children_exposure,
            "general_information": prefs.general_information,
        }

        if not record:
            record = UserPreferenceRecord(
                user_identifier=cls.DEFAULT_USER_ID,
                flags=json.dumps(flags_dict),
                custom_avoidances=json.dumps(prefs.custom_avoidances),
                notes=prefs.notes
            )
            db.add(record)
        else:
            record.flags = json.dumps(flags_dict)
            record.custom_avoidances = json.dumps(prefs.custom_avoidances)
            record.notes = prefs.notes

        db.commit()
        db.refresh(record)
        return prefs

    @staticmethod
    def match_ingredient_preferences(ingredient_dict: dict, prefs: UserPreferences) -> List[str]:
        matched = []
        name_lower = ingredient_dict.get("name", "").lower()
        canon_lower = ingredient_dict.get("canonical_name", "").lower()
        func_lower = ingredient_dict.get("function", "").lower()
        concern_lower = ingredient_dict.get("potential_concern", "").lower()
        full_text = f"{name_lower} {canon_lower} {func_lower} {concern_lower}"

        # 1. Fragrance
        if prefs.fragrance:
            if any(k in full_text for k in ["fragrance", "parfum", "aroma", "limonene", "linalool", "perfume", "scent"]):
                matched.append("Fragrance / Scent Compound")

        # 2. Skin Irritation
        if prefs.skin_irritation:
            if any(k in full_text for k in ["irritat", "sulfate", "sls", "sles", "strip", "sensitiz", "dermatitis"]):
                matched.append("Potential Skin Sensitizer / Irritant")

        # 3. Allergens
        if prefs.allergens:
            if any(k in full_text for k in ["allergen", "sensitiz", "paraben", "phenoxyethanol", "soy", "msg", "limonene", "linalool"]):
                matched.append("Identified Common Allergen")

        # 4. Food Additives
        if prefs.food_additives:
            if any(k in full_text for k in ["sweetener", "aspartame", "sucralose", "benzoate", "sorbate", "msg", "glutamate", "preservative"]):
                matched.append("Food Additive / Preservative")

        # 5. Environmental Impact
        if prefs.environmental_impact:
            if any(k in full_text for k in ["optical brightener", "aquatic", "persisten", "ecotox", "biodegrad"]):
                matched.append("Environmental Concern Note")

        # 6. Children's Exposure
        if prefs.children_exposure:
            if any(k in full_text for k in ["infant", "child", "respiratory", "tear", "paraben", "sls"]):
                matched.append("Review for Child Sensitivity")

        # 7. Custom avoidances
        for avoid_term in prefs.custom_avoidances:
            term_clean = avoid_term.strip().lower()
            if term_clean and term_clean in full_text:
                matched.append(f"Avoided: {avoid_term.strip()}")

        return list(dict.fromkeys(matched))

preference_service = PreferenceService()
