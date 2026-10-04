import re
import json
import base64
import logging
from typing import Optional, Dict, Any, List
import httpx
from backend.app.config import settings
from backend.app.schemas.ollama import OllamaStatusResponse

logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip("/")
        self.model = settings.OLLAMA_MODEL
        self.timeout = settings.OLLAMA_TIMEOUT_SECONDS

    async def check_status(self) -> OllamaStatusResponse:
        """
        Detects whether Ollama is running and whether the primary model (gemma4:12b) is available.
        """
        url = f"{self.base_url}/api/tags"
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    models = [m.get("name", "") for m in data.get("models", [])]
                    # Check exact model name or prefix (e.g. gemma4:12b)
                    target_model = self.model.lower()
                    is_available = any(target_model in m.lower() for m in models)
                    
                    status_text = "CONNECTED" if is_available else "MODEL NOT FOUND"
                    msg = None if is_available else f"Model '{self.model}' is not installed in Ollama. Run: `ollama run {self.model}`"
                    
                    return OllamaStatusResponse(
                        connected=True,
                        model=self.model,
                        available=is_available,
                        status_text=status_text,
                        base_url=self.base_url,
                        installed_models=models,
                        message=msg
                    )
                else:
                    return OllamaStatusResponse(
                        connected=False,
                        model=self.model,
                        available=False,
                        status_text="OFFLINE",
                        base_url=self.base_url,
                        message=f"Ollama returned HTTP status {resp.status_code}"
                    )
        except Exception as e:
            logger.warning("Ollama connection check failed: %s", e)
            return OllamaStatusResponse(
                connected=False,
                model=self.model,
                available=False,
                status_text="OFFLINE",
                base_url=self.base_url,
                message=f"Could not connect to Ollama at {self.base_url}. Ensure Ollama is running (`ollama serve`)."
            )

    @staticmethod
    def extract_json_from_text(text: str) -> Optional[dict]:
        """
        Extracts valid JSON dictionary from model output even when surrounded
        by markdown fences or conversational preambles.
        """
        if not text:
            return None

        # 1. Look for ```json ... ``` blocks
        json_fence = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
        if json_fence:
            try:
                return json.loads(json_fence.group(1))
            except json.JSONDecodeError:
                pass

        # 2. Look for the outermost { ... }
        brace_match = re.search(r"(\{.*\})", text, re.DOTALL)
        if brace_match:
            try:
                return json.loads(brace_match.group(1))
            except json.JSONDecodeError:
                # Attempt minor cleanups: trailing commas before } or ]
                cleaned = re.sub(r",\s*([\}\]])", r"\1", brace_match.group(1))
                try:
                    return json.loads(cleaned)
                except Exception:
                    pass

        # 3. Direct parse
        try:
            return json.loads(text.strip())
        except Exception:
            return None

    async def analyze_label_image(self, image_bytes: bytes) -> Optional[dict]:
        """
        Sends product image to Gemma 4 12B multimodal model via Ollama.
        """
        b64_image = base64.b64encode(image_bytes).decode("utf-8")
        
        system_instruction = (
            "You are a scientific product label analyst for 'WHAT'S INSIDE?'. "
            "Examine this product label image carefully. "
            "Extract the exact product name, classify its category, subcategory, and transcribe all ingredients. "
            "Categories must be one of: food, cosmetics, cleaning, medicine, baby, pet, gardening, automotive, craft, electronics, diy, water. "
            "Return strictly a JSON object with this schema: "
            "{\n"
            '  "product_name": "...",\n'
            '  "category": "food" | "cosmetics" | "cleaning" | "medicine" | "baby" | "pet" | "gardening" | "automotive" | "craft" | "electronics" | "diy" | "water",\n'
            '  "subcategory": "...",\n'
            '  "raw_text": "...",\n'
            '  "ingredients": ["Ingredient 1", "Ingredient 2", ...],\n'
            '  "summary": "Brief 1-2 sentence neutral plain-language summary of what kind of product this is."\n'
            "}\n"
            "Do NOT invent unreadable ingredients. If unreadable, indicate in raw_text."
        )

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": system_instruction,
                    "images": [b64_image]
                }
            ],
            "stream": False,
            "format": "json"
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(f"{self.base_url}/api/chat", json=payload)
                if resp.status_code == 200:
                    result = resp.json()
                    content = result.get("message", {}).get("content", "")
                    parsed = self.extract_json_from_text(content)
                    return parsed
                else:
                    logger.error("Ollama image analysis failed with code %s: %s", resp.status_code, resp.text)
                    return None
        except Exception as e:
            logger.error("Exception calling Ollama vision: %s", e)
            return None

    async def analyze_ingredient_text(self, text: str, product_name: Optional[str] = None) -> Optional[dict]:
        """
        Parses raw ingredient text with Gemma 4 12B.
        """
        system_instruction = (
            "You are a scientific product label analyst. "
            "Given the user's ingredient text or label transcription, extract the product name, "
            "classify the category, subcategory, and break down the individual ingredients. "
            "Categories must be one of: food, cosmetics, cleaning, medicine, baby, pet, gardening, automotive, craft, electronics, diy, water. "
            "Return strictly a JSON object with this schema: "
            "{\n"
            '  "product_name": "...",\n'
            '  "category": "...",\n'
            '  "subcategory": "...",\n'
            '  "raw_text": "...",\n'
            '  "ingredients": ["Ingredient 1", "Ingredient 2", ...],\n'
            '  "summary": "..."\n'
            "}"
        )

        user_content = f"Product Name: {product_name or 'Unknown'}\nIngredient Text:\n{text}"

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_content}
            ],
            "stream": False,
            "format": "json"
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(f"{self.base_url}/api/chat", json=payload)
                if resp.status_code == 200:
                    result = resp.json()
                    content = result.get("message", {}).get("content", "")
                    parsed = self.extract_json_from_text(content)
                    return parsed
                else:
                    logger.error("Ollama text parsing failed with code %s", resp.status_code)
                    return None
        except Exception as e:
            logger.error("Exception calling Ollama text: %s", e)
            return None

ollama_service = OllamaService()
