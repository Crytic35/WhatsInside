import React, { useState, useEffect } from 'react';
import type { ProductAnalysis, ProductComparison, DemoProduct } from '../types';
import { compareProducts } from '../lib/api';
import { ArrowLeftRight, Loader2 } from 'lucide-react';

interface CompareViewProps {
  demoProducts: DemoProduct[];
  currentAnalysis: ProductAnalysis | null;
  onSelectProductForAnalysis?: (analysis: ProductAnalysis) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  demoProducts,
  currentAnalysis,
}) => {
  const [productAId, setProductAId] = useState<string>(
    currentAnalysis?.id && demoProducts.some((p) => p.id === currentAnalysis.id)
      ? currentAnalysis.id
      : (demoProducts[0]?.id || 'demo-shampoo')
  );
  const [productBId, setProductBId] = useState<string>(
    demoProducts[3]?.id || 'demo-cosmetic'
  );
  const [comparison, setComparison] = useState<ProductComparison | null>(null);
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const loadComparison = async (aId: string, bId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await compareProducts(undefined, undefined, aId, bId);
      setComparison(res);
    } catch (err: any) {
      setError(err.message || 'Comparison failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (demoProducts.length >= 2) {
      loadComparison(productAId, productBId);
    }
  }, [demoProducts, productAId, productBId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 animate-editorial-fade">

      {/* Header card */}
      <div className="border border-forest-900 bg-paper-light shadow-sheet">

        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-forest-900/12 bg-paper-warm/60 font-mono text-[10px] text-ink-muted uppercase tracking-widest">
          <div className="flex items-center gap-2 text-forest-900 font-bold">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Comparative Chemical Profile</span>
            <span>/</span>
            <span className="text-forest-700 font-normal">Specimen Overlap Analysis</span>
          </div>
          <span>Dual Monograph Intake</span>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-medium text-forest-950 tracking-tightest">
              Formulation Comparison
            </h1>
            <p className="font-mono text-xs text-ink-muted mt-2">
              Inspect overlapping carrier agents, distinct actives, and preference alignment — without fear-mongering.
            </p>
          </div>

          {/* Product selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-forest-900/12">

            <div className="space-y-2">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest">
                <span className="w-2 h-2 bg-lime flex-shrink-0" />
                <span className="text-forest-700">Specimen A</span>
              </div>
              <select
                value={productAId}
                onChange={(e) => setProductAId(e.target.value)}
                className="input-base"
              >
                {demoProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.product_name} ({p.subcategory})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest">
                <span className="w-2 h-2 bg-gold flex-shrink-0" />
                <span className="text-forest-700">Specimen B</span>
              </div>
              <select
                value={productBId}
                onChange={(e) => setProductBId(e.target.value)}
                className="input-base"
              >
                {demoProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.product_name} ({p.subcategory})
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="p-14 text-center border border-forest-900/20 bg-paper-light font-mono text-sm text-forest-800 flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-forest-700" />
          <span>Comparing chemical profiles…</span>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="p-4 bg-coral-light border border-coral text-coral-dark font-mono text-xs">
          {error}
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && comparison && (
        <div className="space-y-8">

          {/* Preference verdict */}
          <div className="border border-forest-900 bg-paper-light shadow-sheet p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-forest-950 uppercase tracking-widest">
              <span className="w-2.5 h-2.5 bg-lime flex-shrink-0" />
              <span>For Your Preferences · Formulation Synthesis</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-display font-medium text-forest-950 tracking-tightest">
              {comparison.preference_verdict}
            </h3>

            <div className="font-body text-sm text-ink leading-relaxed p-5 border-l-4 border-l-lime border border-forest-900/12 bg-paper space-y-2">
              <p>{comparison.preference_rationale}</p>
            </div>

            <div className="font-mono text-[11px] text-ink-muted italic border-t border-forest-900/10 pt-3">
              <strong>Objective Philosophy:</strong> {comparison.safety_philosophy_reminder}
            </div>
          </div>

          {/* Shared ingredients */}
          <div className="border border-forest-900 bg-paper-light shadow-subtle p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-forest-900/12 pb-3">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-forest-950 uppercase tracking-widest">
                <span className="w-2 h-2 bg-forest-700 flex-shrink-0" />
                <span>Shared Formulation Base ({comparison.shared_ingredients.length} ingredients)</span>
              </div>
              <span className="font-mono text-[10px] text-ink-muted hidden sm:inline">
                Overlapping carriers & vehicles
              </span>
            </div>

            {comparison.shared_ingredients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {comparison.shared_ingredients.map((item, idx) => (
                  <div key={idx} className="p-3.5 border border-forest-900/15 border-l-4 border-l-forest-700 bg-paper font-mono text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-forest-950 truncate">{item.canonical_name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 border border-gold/50 text-gold-dark bg-gold-light/60 font-bold flex-shrink-0">
                        {item.evidence_level}
                      </span>
                    </div>
                    <div className="text-[11px] text-forest-700">{item.function}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-mono text-xs text-ink-muted italic p-2">
                No overlapping ingredients between these two products.
              </p>
            )}
          </div>

          {/* Unique per product */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Specimen A — Forest / Lime */}
            <div className="border-2 border-forest-900 bg-paper-light overflow-hidden shadow-sheet">
              <div className="bg-forest-950 text-paper p-5 border-b-2 border-b-lime space-y-1">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-lime uppercase font-bold tracking-wider">Specimen A Chemistry</span>
                  <span className="text-forest-300">{comparison.product_a_unique.length} exclusive</span>
                </div>
                <h4 className="text-xl font-display font-medium text-paper line-clamp-1">
                  {comparison.product_a_name}
                </h4>
              </div>

              <div className="p-5 space-y-2.5">
                {comparison.product_a_unique.map((item, idx) => (
                  <div key={idx} className="p-3.5 border border-forest-900/15 border-l-4 border-l-lime bg-paper font-mono text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-forest-950 truncate">{item.canonical_name}</span>
                      <span className="text-[10px] border border-forest-900/20 px-1.5 py-0.5 bg-paper-warm text-forest-900 flex-shrink-0">
                        {item.concern_level}
                      </span>
                    </div>
                    <div className="text-[11px] text-forest-700">{item.function}</div>
                    {item.preference_flag && (
                      <div className="text-[10px] text-coral-dark bg-coral-light border border-coral/30 px-2 py-0.5">
                        Alert: {item.preference_flag}
                      </div>
                    )}
                  </div>
                ))}
                {comparison.product_a_unique.length === 0 && (
                  <p className="font-mono text-xs text-ink-muted italic p-2">
                    All ingredients shared with Specimen B.
                  </p>
                )}
              </div>
            </div>

            {/* Specimen B — Deep Slate / Gold */}
            <div className="border-2 border-[#2D4A5E] bg-paper-light overflow-hidden shadow-sheet">
              <div className="bg-[#192A38] text-paper p-5 border-b-2 border-b-gold space-y-1">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-gold uppercase font-bold tracking-wider">Specimen B Chemistry</span>
                  <span className="text-slate-300">{comparison.product_b_unique.length} exclusive</span>
                </div>
                <h4 className="text-xl font-display font-medium text-paper line-clamp-1">
                  {comparison.product_b_name}
                </h4>
              </div>

              <div className="p-5 space-y-2.5">
                {comparison.product_b_unique.map((item, idx) => (
                  <div key={idx} className="p-3.5 border border-forest-900/15 border-l-4 border-l-gold bg-paper font-mono text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-forest-950 truncate">{item.canonical_name}</span>
                      <span className="text-[10px] border border-forest-900/20 px-1.5 py-0.5 bg-paper-warm text-forest-900 flex-shrink-0">
                        {item.concern_level}
                      </span>
                    </div>
                    <div className="text-[11px] text-forest-700">{item.function}</div>
                    {item.preference_flag && (
                      <div className="text-[10px] text-coral-dark bg-coral-light border border-coral/30 px-2 py-0.5">
                        Alert: {item.preference_flag}
                      </div>
                    )}
                  </div>
                ))}
                {comparison.product_b_unique.length === 0 && (
                  <p className="font-mono text-xs text-ink-muted italic p-2">
                    All ingredients shared with Specimen A.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
