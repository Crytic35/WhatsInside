# WHAT'S INSIDE?

> *"Understand what you're actually buying."*

A local-first, privacy-preserving AI consumer product intelligence instrument. Scan almost any consumer product label to uncover what each ingredient does, what verified regulatory and toxicological evidence says, and what remains unknown—without panic, fear-mongering, or binary "safe vs dangerous" fallacies.

Built for **Hacktoberfest / Dev Weekend** under the theme: **"Build for a Friend"**.

---

## 1. Why This Project Exists

Most consumers stare at product ingredient lists—on food, cosmetics, shampoos, laundry detergents, and OTC remedies—without understanding what they actually mean. 

Standard consumer scanner apps frequently commit one of two severe errors:
1. **Fear-Mongering & Chemophobia:** Slapping red "Toxic 8/10" scores on benign, essential ingredients (like table salt, baking soda, or citric acid) simply because they sound like chemicals.
2. **"Natural" Fallacy:** Assuming anything botanical is automatically risk-free, while synthetic preservatives are universally toxic.

**WHAT'S INSIDE?** was built for a friend who has skin sensitivities and wants transparent, scientific, evidence-grounded facts rather than marketing claims or scare tactics.

### Core Philosophy: Hazard ≠ Risk

| Concept | Definition |
| :--- | :--- |
| **Hazard** | An intrinsic property of a chemical substance (e.g., undiluted sodium carbonate powder causes eye irritation). |
| **Risk** | The actual probability of harm under real-world usage—determined by finished concentration, exposure duration, rinsing, skin barrier health, and individual sensitivity. |

> **Fundamental Product Limitation:**  
> *"The ingredient list does not provide the concentration, so product-specific risk cannot be determined from the label alone."*  
> If an ingredient's evidence is missing from the local database, the system states:  
> *"Ingredient identified, but evidence is not currently available in the local knowledge base."* It **never hallucinates** missing evidence or medical classifications.

---

## 2. Key Capabilities

- **Multimodal Visual Inspection:** Photograph or upload any packaging label to run local OCR and structured entity extraction through **Gemma 4:12B**.
- **Automated Category Classification:** Categorizes products across 12 extensible domains:
  - Food & Beverages
  - Personal Care & Cosmetics
  - Cleaning & Household
  - Medicine & Health
  - Baby & Children
  - Pet Products
  - Gardening & Plant Products
  - Automotive & Maintenance
  - Stationery / Craft / Art
  - Electronics / Technical Products
  - Building / DIY / Hardware
  - Water / Water-Treatment Products
- **Scientific Evidence Dossier:** Cross-references each canonical chemical entity against authoritative research (FDA, EFSA, CIR, SCCS, EPA, A.I.S.E., WHO/JECFA).
- **"What Matters" vs. "What We Don't Know":** Surfaces the few ingredients that genuinely warrant attention (e.g. potential contact allergens, oxidizable terpenes, or respiratory irritants) while clearly stating concentration unknowns.
- **Dual Explanation Modes:**
  - **Just Tell Me What Matters:** Plain-language summary (What it does, why it's there, what you should care about, what we don't know).
  - **Technical Explanation:** Full formulation rationale, exposure pathways, and regulatory governance.
- **Editorial Personalization Profile:** Tailor flags based on personal concerns (Fragrance, Skin Irritation, Allergens, Food Additives, Environmental Impact, Children's Exposure, and custom *"I avoid ______"* tags).
- **Product Comparison Sheet:** Compare Product A against Product B side-by-side, isolating shared carrier chemistry, unique actives, and preference alignment.
- **Local AI & Offline Demo Mode:** Treated as a first-class citizen. Detects local Ollama status in real time and offers pre-cataloged reference monographs when operating offline.

---

## 3. Visual Identity: "Editorial Laboratory"

The interface blends:
- High-contrast editorial typography (**Newsreader** for headlines, **DM Sans** for reading, **IBM Plex Mono** for scientific data).
- A tactile palette: Deep Forest (`#10231D`), Warm Paper (`#F1EFE7`), Manila Sand (`#D9C7A2`), Terracotta Attention (`#D86A3A`), and Acid Lime (`#C7E65B`).
- Asymmetrical layout with an interactive **Inspection Tray** featuring animated laser sweeps, fine hairline measurement rules, and an indexed specimen ledger.

---

## 4. Architecture

```
                    ┌────────────────────────────┐
                    │       PRODUCT IMAGE        │
                    │   (Photograph or Upload)   │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │        GEMMA 4:12B         │
                    │    (Local Ollama Vision)   │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │      LABEL EXTRACTION      │
                    │    & ENTITY EXTRACTION     │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │     PRODUCT CLASSIFIER     │
                    │  (data/categories/*.json)  │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │     NAME NORMALIZATION     │
                    │    (Alias & INCI mapping)  │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │     EVIDENCE RETRIEVAL     │
                    │   (SQLite Knowledge DB)    │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │      CONCERN ANALYSIS      │
                    │   (Hazard vs Risk Logic)   │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │  PERSONALIZED EXPLANATION  │
                    │    & WHAT MATTERS VIEWS    │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │  EDITORIAL LABORATORY UI   │
                    │     (React + Tailwind)     │
                    └────────────────────────────┘
```

---

## 5. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend:** Python 3.12, FastAPI, SQLAlchemy, Pydantic, HTTPX, Pillow, Uvicorn.
- **Database:** SQLite (persisted as `whats_inside.db` with 32+ seeded monographs and user preference storage).
- **Local AI:** Ollama running **Gemma 4:12B** (vision + completion).

---

## 6. Setup & Installation

### Prerequisites
- Python 3.10+ (Python 3.12 verified)
- Node.js 18+ (Node v24.19 verified)
- [Ollama](https://ollama.com/) installed locally

### Step 1: Start Ollama & Pull Gemma 4:12B
```bash
# Start the Ollama background daemon
ollama serve

# Pull and verify the vision model
ollama run gemma4:12b
```

### Step 2: Backend Setup
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Run backend test suite
python -m pytest backend/tests -v

# Start FastAPI server on port 8000
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`

### Step 3: Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server on port 5173
npm run dev -- --host 127.0.0.1 --port 5173
```
Open your browser to: `http://127.0.0.1:5173`

---

## 7. Testing

The backend test suite runs deterministically without requiring Ollama to be active:

```bash
python -m pytest backend/tests -v
```

Verifies:
- `test_health_check` & `test_root_endpoint`
- `test_ollama_status_endpoint` & markdown JSON recovery
- `test_known_ingredient_lookup` & alias resolution (e.g. SLES, MSG)
- `test_unknown_ingredient_lookup_strictly_disclosed` (zero hallucinated sources)
- `test_preferences_lifecycle` (persistence across updates)
- `test_text_analysis_endpoint` & `test_image_analysis_endpoint`
- `test_product_comparison_endpoint`

Frontend build check:
```bash
cd frontend && npm run build
```

---

## 8. Why Open-Source & Local AI Matters

1. **Complete Privacy:** Product labels and photographs never leave your workstation. No cloud uploads, third-party analytics, or data harvesting.
2. **Model Ownership & Reproducibility:** You control the model weights, prompt boundaries, and temperature.
3. **No Mandatory Subscription API:** Runs on consumer GPUs (e.g., NVIDIA RTX 4060 8 GB VRAM) at zero marginal token cost.
4. **Extensibility:** Easily add categories under `data/categories/*.json` or enrich monographs under `data/ingredients/seed_ingredients.json`.

---

## 9. License & Disclaimer

Built for Hacktoberfest / Dev Weekend 2026 under the MIT License.  
*Disclaimer: For informational and research purposes only. Not intended as medical diagnosis, prescriptive treatment, or legal regulatory compliance advice.*
