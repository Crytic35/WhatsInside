import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
SAMPLE_DATA_DIR = BASE_DIR / "sample_data"

class Settings(BaseModel):
    PROJECT_NAME: str = "WHAT'S INSIDE?"
    TAGLINE: str = "Understand what you're actually buying."
    VERSION: str = "1.0.0"
    
    # Ollama Configuration
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "gemma4:12b")
    OLLAMA_TIMEOUT_SECONDS: float = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "120.0"))
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'whats_inside.db'}")
    
    # Paths
    CATEGORIES_DIR: Path = DATA_DIR / "categories"
    INGREDIENTS_FILE: Path = DATA_DIR / "ingredients" / "seed_ingredients.json"
    DEMO_PRODUCTS_FILE: Path = SAMPLE_DATA_DIR / "demo_products.json"
    
    # Demo Mode Default
    DEMO_MODE_FALLBACK: bool = True

settings = Settings()
