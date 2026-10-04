from fastapi import APIRouter
from backend.app.api.ollama_router import router as ollama_router
from backend.app.api.analysis_router import router as analysis_router
from backend.app.api.ingredient_router import router as ingredient_router
from backend.app.api.compare_router import router as compare_router
from backend.app.api.preference_router import router as preference_router
from backend.app.api.categories_router import router as categories_router

api_router = APIRouter(prefix="/api")

api_router.include_router(ollama_router)
api_router.include_router(analysis_router)
api_router.include_router(ingredient_router)
api_router.include_router(compare_router)
api_router.include_router(preference_router)
api_router.include_router(categories_router)
