export type ConcernLevel = 
  | 'LOW CONCERN'
  | 'MODERATE CONCERN'
  | 'NEEDS ATTENTION'
  | 'INSUFFICIENT INFORMATION';

export type EvidenceLevel = 
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'UNKNOWN';

export interface OllamaStatus {
  connected: boolean;
  model: string;
  available: boolean;
  status_text: string;
  base_url: string;
  installed_models: string[];
  message?: string | null;
}

export interface AnalyzedIngredient {
  name: string;
  canonical_name: string;
  category: string;
  function: string;
  why_used: string;
  potential_concern: string;
  concern_level: ConcernLevel;
  evidence_level: EvidenceLevel;
  evidence_summary: string;
  unknown_info: string;
  sources: string[];
  matched_preferences: string[];
  is_known_in_db: boolean;
}

export interface JustTellMeWhatMatters {
  what_it_does: string;
  why_its_there: string;
  what_i_should_care_about: string;
  what_we_dont_know: string;
}

export interface ProductAnalysis {
  id: string;
  product_name: string;
  category: string;
  category_name: string;
  subcategory: string;
  raw_text: string;
  is_demo: boolean;
  ai_model_used: string;
  what_should_i_know: string;
  just_tell_me_what_matters: JustTellMeWhatMatters;
  technical_explanation: string;
  ingredients: AnalyzedIngredient[];
  preference_highlights: string[];
  regulatory_context: string;
  limitations: string;
  disclaimer: string;
}

export interface UserPreferences {
  skin_irritation: boolean;
  fragrance: boolean;
  allergens: boolean;
  food_additives: boolean;
  environmental_impact: boolean;
  children_exposure: boolean;
  general_information: boolean;
  custom_avoidances: string[];
  notes?: string;
}

export interface ComparisonIngredientItem {
  canonical_name: string;
  in_product_a: boolean;
  in_product_b: boolean;
  function: string;
  concern_level: ConcernLevel;
  evidence_level: EvidenceLevel;
  preference_flag?: string | null;
}

export interface ProductComparison {
  product_a_name: string;
  product_b_name: string;
  shared_ingredients: ComparisonIngredientItem[];
  product_a_unique: ComparisonIngredientItem[];
  product_b_unique: ComparisonIngredientItem[];
  preference_verdict: string;
  preference_rationale: string;
  safety_philosophy_reminder: string;
}

export interface DemoProduct {
  id: string;
  product_name: string;
  category: string;
  subcategory: string;
  description: string;
  raw_text: string;
  is_demo: boolean;
  summary: string;
  ingredients: AnalyzedIngredient[];
}
