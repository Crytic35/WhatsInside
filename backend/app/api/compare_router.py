from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.comparison import ProductComparisonRequest, ProductComparisonResponse
from backend.app.services.comparison_service import comparison_service
from backend.app.services.demo_service import demo_service
from backend.app.services.analysis_service import analysis_service

router = APIRouter(prefix="/compare", tags=["Compare"])

@router.post("", response_model=ProductComparisonResponse)
def compare_products(req: ProductComparisonRequest, db: Session = Depends(get_db)):
    """
    Compare two analyzed products, highlighting shared components, unique components,
    and personalized preference alignment.
    """
    prod_a = req.product_a_analysis
    prod_b = req.product_b_analysis

    # If IDs were provided, load them from demo service if analysis object not directly passed
    if not prod_a and req.product_a_id:
        demo_a = demo_service.get_demo_product_by_id(req.product_a_id)
        if demo_a:
            prod_a = analysis_service.process_extracted_data(db, demo_a, is_demo=True, ai_model="Demo Data")

    if not prod_b and req.product_b_id:
        demo_b = demo_service.get_demo_product_by_id(req.product_b_id)
        if demo_b:
            prod_b = analysis_service.process_extracted_data(db, demo_b, is_demo=True, ai_model="Demo Data")

    if not prod_a or not prod_b:
        # Fallback to compare demo shampoo with demo cosmetic if not specified
        demos = demo_service.get_all_demo_products()
        if len(demos) >= 2:
            prod_a = prod_a or analysis_service.process_extracted_data(db, demos[0], is_demo=True, ai_model="Demo Data")
            prod_b = prod_b or analysis_service.process_extracted_data(db, demos[3], is_demo=True, ai_model="Demo Data")
        else:
            raise HTTPException(status_code=400, detail="Two products must be provided for comparison.")

    return comparison_service.compare_products(db, prod_a, prod_b)
