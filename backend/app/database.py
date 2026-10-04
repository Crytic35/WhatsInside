import json
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from backend.app.config import settings

logger = logging.getLogger(__name__)

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from backend.app.models.ingredient import Ingredient
    from backend.app.models.preference import UserPreferenceRecord
    Base.metadata.create_all(bind=engine)
    seed_initial_data()

def seed_initial_data():
    from backend.app.models.ingredient import Ingredient
    
    db: Session = SessionLocal()
    try:
        count = db.query(Ingredient).count()
        if count > 0:
            logger.info("Ingredient database already seeded (%s entries).", count)
            return

        if not settings.INGREDIENTS_FILE.exists():
            logger.warning("Seed ingredients file not found at %s", settings.INGREDIENTS_FILE)
            return

        with open(settings.INGREDIENTS_FILE, "r", encoding="utf-8") as f:
            items = json.load(f)

        for item in items:
            ing = Ingredient(
                canonical_name=item["canonical_name"],
                aliases=json.dumps([a.lower().strip() for a in item.get("aliases", [])]),
                category=item.get("category", "general"),
                functions=json.dumps(item.get("functions", [])),
                common_uses=item.get("common_uses", ""),
                known_concerns=item.get("known_concerns", ""),
                concern_level=item.get("concern_level", "LOW CONCERN"),
                evidence_level=item.get("evidence_level", "HIGH"),
                evidence_summary=item.get("evidence_summary", ""),
                exposure_notes=item.get("exposure_notes", ""),
                regulatory_notes=item.get("regulatory_notes", ""),
                source_urls=json.dumps(item.get("source_urls", [])),
                unknown_info=item.get("unknown_info", "Product-specific concentration is not provided on label."),
                last_reviewed=item.get("last_reviewed", "2026-01-01")
            )
            db.add(ing)
        db.commit()
        logger.info("Successfully seeded %d ingredients into database.", len(items))
    except Exception as e:
        db.rollback()
        logger.error("Error seeding ingredients: %s", e)
    finally:
        db.close()
