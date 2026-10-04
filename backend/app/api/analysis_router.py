import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.analysis import (
    ProductAnalysisResponse,
    TextAnalysisRequest
)
from backend.app.services.analysis_service import analysis_service
from backend.app.services.demo_service import demo_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="", tags=["Analysis"])

@router.post("/analyze/image", response_model=ProductAnalysisResponse)
async def analyze_product_image(
    file: UploadFile = File(...),
    fallback_demo: bool = Form(True),
    db: Session = Depends(get_db)
):
    """
    Accepts an image of a consumer product label.
    Uses Gemma 4:12B via Ollama to perform OCR and structured extraction,
    then cross-references the local scientific evidence database.
    """
    try:
        image_bytes = await file.read()
        if len(image_bytes) < 100:
            raise HTTPException(status_code=400, detail="Uploaded image file is empty or corrupted.")
        
        result = await analysis_service.analyze_image(db, image_bytes, fallback_demo=fallback_demo)
        return result
    except Exception as e:
        logger.error("Error analyzing image: %s", e)
        if fallback_demo:
            demo_p = demo_service.get_demo_product_by_id("demo-shampoo") or demo_service.get_all_demo_products()[0]
            return analysis_service.process_extracted_data(db, demo_p, is_demo=True, ai_model="Demo Data Fallback")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze/text", response_model=ProductAnalysisResponse)
async def analyze_product_text(
    req: TextAnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Accepts manual ingredient text / label transcriptions.
    """
    try:
        result = await analysis_service.analyze_text(
            db,
            text=req.text,
            product_name=req.product_name,
            fallback_demo=req.use_demo_fallback
        )
        return result
    except Exception as e:
        logger.error("Error analyzing text: %s", e)
        if req.use_demo_fallback:
            demo_p = demo_service.match_demo_product(req.text)
            return analysis_service.process_extracted_data(db, demo_p, is_demo=True, ai_model="Demo Data Fallback")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/demo/products", response_model=List[dict])
def list_demo_products():
    """
    Returns list of deterministic sample products for testing without local inference.
    """
    return demo_service.get_all_demo_products()

@router.get("/demo/products/{product_id}", response_model=ProductAnalysisResponse)
def get_demo_product_analysis(product_id: str, db: Session = Depends(get_db)):
    """
    Returns an analyzed view of a specific sample product with active preference highlights.
    """
    item = demo_service.get_demo_product_by_id(product_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"Demo product '{product_id}' not found.")
    return analysis_service.process_extracted_data(db, item, is_demo=True, ai_model="Deterministic Demo")
