import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent


def _find_dir(dir_name: str) -> Path:
    # 1. Check repo root (local development / monorepo)
    repo_level = BASE_DIR / dir_name
    if repo_level.exists():
        return repo_level
    # 2. Check inside backend/ (isolated service root)
    backend_level = Path(__file__).resolve().parent.parent / dir_name
    if backend_level.exists():
        return backend_level
    return repo_level


DATA_DIR = _find_dir("data")
SAMPLE_DATA_DIR = _find_dir("sample_data")


def _default_db_url() -> str:
    """
    Return the SQLite URL appropriate for the current runtime environment.

    - Vercel (and similar read-only filesystems): use /tmp which is the only
      writable directory available in serverless functions.
    - Local development: use the repo root as before.

    The VERCEL environment variable is set automatically by the Vercel platform
    (value "1") so no manual configuration is needed.
    """
    if os.getenv("VERCEL"):
        return "sqlite:////tmp/whats_inside.db"
    return f"sqlite:///{BASE_DIR / 'whats_inside.db'}"


class Settings(BaseModel):
    PROJECT_NAME: str = "WHAT'S INSIDE?"
    TAGLINE: str = "Understand what you're actually buying."
    VERSION: str = "1.0.0"

    # Ollama Configuration
    # NOTE: Ollama/Gemma runs locally on the developer's machine.
    # On Vercel these env vars will be absent, Ollama will be unreachable,
    # and the backend will automatically fall back to Demo Mode for all requests.
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "gemma4:12b")
    OLLAMA_TIMEOUT_SECONDS: float = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "120.0"))

    # Database
    # Reads DATABASE_URL from env first; falls back to _default_db_url()
    # which selects /tmp on Vercel or the repo-root file locally.
    DATABASE_URL: str = os.getenv("DATABASE_URL", _default_db_url())

    # Paths — static read-only files bundled with the repo
    CATEGORIES_DIR: Path = DATA_DIR / "categories"
    INGREDIENTS_FILE: Path = DATA_DIR / "ingredients" / "seed_ingredients.json"
    DEMO_PRODUCTS_FILE: Path = SAMPLE_DATA_DIR / "demo_products.json"

    # Demo Mode Default
    DEMO_MODE_FALLBACK: bool = True


settings = Settings()
