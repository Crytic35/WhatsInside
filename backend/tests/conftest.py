import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import init_db
from backend.app.schemas.ollama import OllamaStatusResponse

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    init_db()

@pytest.fixture(autouse=True)
def mock_ollama_deterministic():
    """
    Ensures all backend tests run deterministically without requiring live LLM inference.
    """
    with patch("backend.app.services.ollama_service.ollama_service.check_status", new_callable=AsyncMock) as mock_status, \
         patch("backend.app.services.ollama_service.ollama_service.analyze_ingredient_text", new_callable=AsyncMock) as mock_text, \
         patch("backend.app.services.ollama_service.ollama_service.analyze_label_image", new_callable=AsyncMock) as mock_img:
        mock_status.return_value = OllamaStatusResponse(
            connected=True,
            model="gemma4:12b",
            available=True,
            status_text="CONNECTED",
            base_url="http://127.0.0.1:11434",
            installed_models=["gemma4:12b"]
        )
        mock_text.return_value = {
            "product_name": "Hydration Booster",
            "category": "cosmetics",
            "subcategory": "Serum",
            "ingredients": ["Water", "Glycerin", "Niacinamide", "Phenoxyethanol"],
            "summary": "Hydrating daily skin care booster."
        }
        mock_img.return_value = {
            "product_name": "Clarifying Gentle Daily Shampoo",
            "category": "cosmetics",
            "subcategory": "Shampoo",
            "ingredients": ["Water", "Sodium Laureth Sulfate", "Cocamidopropyl Betaine", "Glycerin"],
            "summary": "Gentle daily hair cleanser."
        }
        yield

@pytest.fixture
def client():
    return TestClient(app)
