import type { 
  OllamaStatus, 
  ProductAnalysis, 
  UserPreferences, 
  ProductComparison, 
  DemoProduct 
} from '../types';

/**
 * Base URL for all API calls.
 *
 * Local development:
 *   - If VITE_API_URL is set (e.g. http://localhost:8000), fetch calls use that.
 *   - If VITE_API_URL is not set, API_BASE is '' and the Vite dev-server proxy
 *     transparently forwards /api/* to http://localhost:8000.
 *
 * Production (Vercel):
 *   - VITE_API_URL should NOT be set (or set to '').
 *   - All /api/* calls are relative URLs, which Vercel routes to api/index.py.
 *   - No localhost references exist in production bundles.
 */
const API_BASE = import.meta.env.VITE_API_URL ?? '';

export async function fetchOllamaStatus(): Promise<OllamaStatus> {
  try {
    const res = await fetch(`${API_BASE}/api/ollama/status`);
    if (!res.ok) throw new Error('Status endpoint failed');
    return await res.json();
  } catch (err) {
    return {
      connected: false,
      model: 'gemma4:12b',
      available: false,
      status_text: 'OFFLINE',
      base_url: 'http://localhost:11434',
      installed_models: [],
      message: 'Cannot reach local backend or Ollama server.'
    };
  }
}

export async function analyzeImage(file: File, fallbackDemo: boolean = true): Promise<ProductAnalysis> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fallback_demo', String(fallbackDemo));

  const res = await fetch(`${API_BASE}/api/analyze/image`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Image analysis failed');
  }

  return await res.json();
}

export async function analyzeText(
  text: string, 
  productName?: string, 
  fallbackDemo: boolean = true
): Promise<ProductAnalysis> {
  const res = await fetch(`${API_BASE}/api/analyze/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      product_name: productName,
      use_demo_fallback: fallbackDemo
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Text analysis failed');
  }

  return await res.json();
}

export async function fetchDemoProducts(): Promise<DemoProduct[]> {
  const res = await fetch(`${API_BASE}/api/demo/products`);
  if (!res.ok) throw new Error('Failed to load demo products');
  return await res.json();
}

export async function fetchDemoProductAnalysis(id: string): Promise<ProductAnalysis> {
  const res = await fetch(`${API_BASE}/api/demo/products/${id}`);
  if (!res.ok) throw new Error(`Failed to load demo product ${id}`);
  return await res.json();
}

export async function fetchPreferences(): Promise<UserPreferences> {
  const res = await fetch(`${API_BASE}/api/preferences`);
  if (!res.ok) throw new Error('Failed to fetch preferences');
  return await res.json();
}

export async function updatePreferences(prefs: UserPreferences): Promise<UserPreferences> {
  const res = await fetch(`${API_BASE}/api/preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefs),
  });
  if (!res.ok) throw new Error('Failed to update preferences');
  const data = await res.json();
  return data.preferences;
}

export async function fetchIngredientDetail(name: string) {
  const res = await fetch(`${API_BASE}/api/ingredients/${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error(`Failed to fetch ingredient ${name}`);
  return await res.json();
}

export async function compareProducts(
  productAAnalysis?: ProductAnalysis,
  productBAnalysis?: ProductAnalysis,
  productAId?: string,
  productBId?: string
): Promise<ProductComparison> {
  const res = await fetch(`${API_BASE}/api/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_a_id: productAId,
      product_b_id: productBId,
      product_a_analysis: productAAnalysis,
      product_b_analysis: productBAnalysis,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Comparison failed');
  }

  return await res.json();
}
