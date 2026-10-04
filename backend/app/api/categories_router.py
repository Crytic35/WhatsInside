from typing import List
from fastapi import APIRouter
from backend.app.services.category_service import category_service

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[dict])
def list_categories():
    """
    Returns all dynamically loaded product categories and their subcategories.
    """
    return category_service.get_all_categories()
